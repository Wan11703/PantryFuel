from collections import defaultdict
from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.pantry_item import PantryItem
from app.models.recipe import Recipe

from app.services.pantry_service import (
    get_pantry_items,
)
from app.services.recipe_service import (
    get_recipes,
)

from app.utils.nutrition import (
    NutritionCalculationError,
    convert_quantity_to_grams,
)


def group_pantry_items(
    pantry_items: list[PantryItem],
) -> dict[
    UUID,
    list[PantryItem],
]:
    grouped: dict[
        UUID,
        list[PantryItem],
    ] = defaultdict(list)

    for pantry_item in pantry_items:
        if pantry_item.quantity <= 0:
            continue

        grouped[
            pantry_item.ingredient_id
        ].append(
            pantry_item
        )

    return dict(grouped)


def calculate_recipe_match(
    recipe: Recipe,
    pantry_by_ingredient: dict[
        UUID,
        list[PantryItem],
    ],
) -> dict:
    total_ingredients = len(
        recipe.recipe_ingredients
    )

    matched_ingredients = 0

    missing_ingredients: list[
        dict
    ] = []


    for recipe_ingredient in (
        recipe.recipe_ingredients
    ):
        ingredient = (
            recipe_ingredient.ingredient
        )

        pantry_batches = (
            pantry_by_ingredient.get(
                ingredient.id,
                [],
            )
        )


        # =========================
        # Ingredient completely absent
        # =========================

        if not pantry_batches:
            missing_ingredients.append(
                {
                    "id": ingredient.id,
                    "name": ingredient.name,

                    "quantity":
                        recipe_ingredient.quantity,

                    "unit":
                        recipe_ingredient.unit,

                    "required_grams": None,
                    "available_grams":
                        Decimal("0"),

                    "shortage_grams": None,

                    "reason": "missing",
                }
            )

            continue


        # =========================
        # Convert recipe requirement
        # =========================

        try:
            required_grams = (
                convert_quantity_to_grams(
                    quantity=(
                        recipe_ingredient.quantity
                    ),
                    unit=(
                        recipe_ingredient.unit
                    ),
                    ingredient=ingredient,
                )
            )

        except NutritionCalculationError:
            missing_ingredients.append(
                {
                    "id": ingredient.id,
                    "name": ingredient.name,

                    "quantity":
                        recipe_ingredient.quantity,

                    "unit":
                        recipe_ingredient.unit,

                    "required_grams": None,
                    "available_grams": None,
                    "shortage_grams": None,

                    "reason":
                        "conversion_unavailable",
                }
            )

            continue


        # =========================
        # Aggregate pantry batches
        # =========================

        available_grams = Decimal("0")

        has_unknown_batch = False


        for pantry_item in pantry_batches:
            try:
                batch_grams = (
                    convert_quantity_to_grams(
                        quantity=(
                            pantry_item.quantity
                        ),
                        unit=(
                            pantry_item.unit
                        ),
                        ingredient=ingredient,
                    )
                )

                available_grams += (
                    batch_grams
                )

            except NutritionCalculationError:
                has_unknown_batch = True


        # =========================
        # Enough known quantity
        # =========================

        if (
            available_grams
            >= required_grams
        ):
            matched_ingredients += 1

            continue


        # =========================
        # Some quantity can't be converted
        # =========================

        if has_unknown_batch:
            missing_ingredients.append(
                {
                    "id": ingredient.id,
                    "name": ingredient.name,

                    "quantity":
                        recipe_ingredient.quantity,

                    "unit":
                        recipe_ingredient.unit,

                    "required_grams":
                        required_grams,

                    "available_grams":
                        available_grams,

                    "shortage_grams": None,

                    "reason":
                        "conversion_unavailable",
                }
            )

            continue


        # =========================
        # Ingredient exists,
        # but not enough
        # =========================

        shortage_grams = (
            required_grams
            - available_grams
        )


        missing_ingredients.append(
            {
                "id": ingredient.id,
                "name": ingredient.name,

                "quantity":
                    recipe_ingredient.quantity,

                "unit":
                    recipe_ingredient.unit,

                "required_grams":
                    required_grams,

                "available_grams":
                    available_grams,

                "shortage_grams":
                    shortage_grams,

                "reason":
                    "insufficient",
            }
        )


    # =============================
    # Match percentage
    # =============================

    if total_ingredients == 0:
        match_percentage = (
            Decimal("0")
        )

    else:
        match_percentage = (
            Decimal(
                matched_ingredients
            )
            / Decimal(
                total_ingredients
            )
            * Decimal("100")
        ).quantize(
            Decimal("0.01")
        )


    can_cook = (
        total_ingredients > 0
        and matched_ingredients
        == total_ingredients
    )


    return {
        "recipe": recipe,

        "total_ingredients":
            total_ingredients,

        "matched_ingredients":
            matched_ingredients,

        "match_percentage":
            match_percentage,

        "can_cook":
            can_cook,

        "missing_ingredients":
            missing_ingredients,
    }


def get_recipe_matches(
    db: Session,
    user_id: UUID,
) -> list[dict]:
    pantry_items = get_pantry_items(
        db,
        user_id,
    )

    recipes = get_recipes(
        db
    )


    pantry_by_ingredient = (
        group_pantry_items(
            pantry_items
        )
    )


    matches = [
        calculate_recipe_match(
            recipe,
            pantry_by_ingredient,
        )
        for recipe in recipes
    ]


    matches.sort(
        key=lambda match: (
            match["can_cook"],
            match[
                "match_percentage"
            ],
        ),
        reverse=True,
    )


    return matches