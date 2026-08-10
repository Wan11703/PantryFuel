from collections import defaultdict
from datetime import date
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


def get_expiration_urgency(
    expiration_date: date,
    today: date,
) -> Decimal:
    days_remaining = (
        expiration_date - today
    ).days

    # Already expired.
    # These items should not contribute
    # to recommendation priority.
    if days_remaining < 0:
        return Decimal("0")

    if days_remaining == 0:
        return Decimal("100")

    if days_remaining == 1:
        return Decimal("90")

    if days_remaining <= 3:
        return Decimal("75")

    if days_remaining <= 5:
        return Decimal("50")

    if days_remaining <= 7:
        return Decimal("25")

    return Decimal("0")


def sort_pantry_batches(
    pantry_batches: list[PantryItem],
) -> list[PantryItem]:
    """
    FEFO:
    First Expired / Expiring, First Out.

    Dated batches come before
    undated batches.
    """

    return sorted(
        pantry_batches,
        key=lambda item: (
            item.expiration_date is None,
            item.expiration_date
            or date.max,
        ),
    )


def calculate_expiration_priority(
    pantry_batches: list[
        tuple[PantryItem, Decimal]
    ],
    required_grams: Decimal,
    today: date,
) -> tuple[
    Decimal,
    list[dict],
]:
    if required_grams <= 0:
        return (
            Decimal("0"),
            [],
        )


    remaining_grams = (
        required_grams
    )

    weighted_score = (
        Decimal("0")
    )

    expiring_ingredients: list[
        dict
    ] = []


    for (
        pantry_item,
        batch_grams,
    ) in pantry_batches:

        if remaining_grams <= 0:
            break


        quantity_used = min(
            remaining_grams,
            batch_grams,
        )

        remaining_grams -= (
            quantity_used
        )


        if (
            pantry_item.expiration_date
            is None
        ):
            continue


        days_until_expiration = (
            pantry_item.expiration_date
            - today
        ).days


        # Never encourage use of
        # already-expired food.
        if days_until_expiration < 0:
            continue


        urgency_score = (
            get_expiration_urgency(
                pantry_item.expiration_date,
                today,
            )
        )


        if urgency_score <= 0:
            continue


        portion_of_requirement = (
            quantity_used
            / required_grams
        )


        weighted_score += (
            urgency_score
            * portion_of_requirement
        )


        expiring_ingredients.append(
            {
                "id":
                    pantry_item.ingredient.id,

                "name":
                    pantry_item.ingredient.name,

                "expiration_date":
                    pantry_item.expiration_date,

                "days_until_expiration":
                    days_until_expiration,

                "quantity_used_grams":
                    quantity_used.quantize(
                        Decimal("0.01")
                    ),

                "urgency_score":
                    urgency_score,
            }
        )


    return (
        weighted_score.quantize(
            Decimal("0.01")
        ),
        expiring_ingredients,
    )


def calculate_recipe_match(
    recipe: Recipe,
    pantry_by_ingredient: dict[
        UUID,
        list[PantryItem],
    ],
    today: date,
) -> dict:
    total_ingredients = len(
        recipe.recipe_ingredients
    )

    matched_ingredients = 0

    missing_ingredients: list[
        dict
    ] = []

    recipe_expiration_score = (
        Decimal("0")
    )

    expiring_ingredients: list[
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
        # Ingredient absent
        # =========================

        if not pantry_batches:
            missing_ingredients.append(
                {
                    "id":
                        ingredient.id,

                    "name":
                        ingredient.name,

                    "quantity":
                        recipe_ingredient.quantity,

                    "unit":
                        recipe_ingredient.unit,

                    "required_grams":
                        None,

                    "available_grams":
                        Decimal("0"),

                    "shortage_grams":
                        None,

                    "reason":
                        "missing",
                }
            )

            continue


        # =========================
        # Recipe requirement
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
                    "id":
                        ingredient.id,

                    "name":
                        ingredient.name,

                    "quantity":
                        recipe_ingredient.quantity,

                    "unit":
                        recipe_ingredient.unit,

                    "required_grams":
                        None,

                    "available_grams":
                        None,

                    "shortage_grams":
                        None,

                    "reason":
                        "conversion_unavailable",
                }
            )

            continue


        # =========================
        # Convert pantry batches
        # =========================

        converted_batches: list[
            tuple[
                PantryItem,
                Decimal,
            ]
        ] = []

        available_grams = (
            Decimal("0")
        )

        has_unknown_batch = False


        for pantry_item in (
            sort_pantry_batches(
                pantry_batches
            )
        ):

            # Expired food does NOT count
            # as usable inventory.
            if (
                pantry_item.expiration_date
                is not None
                and
                pantry_item.expiration_date
                < today
            ):
                continue


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

            except NutritionCalculationError:
                has_unknown_batch = True

                continue


            available_grams += (
                batch_grams
            )

            converted_batches.append(
                (
                    pantry_item,
                    batch_grams,
                )
            )


        # =========================
        # Expiration priority
        # =========================

        (
            ingredient_expiration_score,
            ingredient_expiring_items,
        ) = calculate_expiration_priority(
            converted_batches,
            required_grams,
            today,
        )


        recipe_expiration_score += (
            ingredient_expiration_score
        )

        expiring_ingredients.extend(
            ingredient_expiring_items
        )


        # =========================
        # Enough quantity
        # =========================

        if (
            available_grams
            >= required_grams
        ):
            matched_ingredients += 1

            continue


        # =========================
        # Unknown conversion
        # =========================

        if has_unknown_batch:
            missing_ingredients.append(
                {
                    "id":
                        ingredient.id,

                    "name":
                        ingredient.name,

                    "quantity":
                        recipe_ingredient.quantity,

                    "unit":
                        recipe_ingredient.unit,

                    "required_grams":
                        required_grams,

                    "available_grams":
                        available_grams,

                    "shortage_grams":
                        None,

                    "reason":
                        "conversion_unavailable",
                }
            )

            continue


        # =========================
        # Insufficient
        # =========================

        shortage_grams = (
            required_grams
            - available_grams
        )


        missing_ingredients.append(
            {
                "id":
                    ingredient.id,

                "name":
                    ingredient.name,

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
    # Pantry Match %
    # =============================

    if total_ingredients == 0:
        match_percentage = (
            Decimal("0")
        )

        expiration_score = (
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


        expiration_score = (
            recipe_expiration_score
            / Decimal(
                total_ingredients
            )
        ).quantize(
            Decimal("0.01")
        )


    can_cook = (
        total_ingredients > 0
        and
        matched_ingredients
        == total_ingredients
    )


    expiring_ingredients.sort(
        key=lambda item: (
            item[
                "expiration_date"
            ]
        )
    )


    return {
        "recipe":
            recipe,

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

        "expiration_score":
            expiration_score,

        "expiring_ingredients":
            expiring_ingredients,
    }


def get_recipe_matches(
    db: Session,
    user_id: UUID,
) -> list[dict]:
    pantry_items = (
        get_pantry_items(
            db,
            user_id,
        )
    )

    recipes = (
        get_recipes(
            db
        )
    )


    pantry_by_ingredient = (
        group_pantry_items(
            pantry_items
        )
    )


    today = date.today()


    matches = [
        calculate_recipe_match(
            recipe,
            pantry_by_ingredient,
            today,
        )
        for recipe in recipes
    ]


    matches.sort(
        key=lambda match: (
            match[
                "can_cook"
            ],
            match[
                "match_percentage"
            ],
            match[
                "expiration_score"
            ],
        ),
        reverse=True,
    )


    return matches