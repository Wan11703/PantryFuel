from decimal import Decimal
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.recipe import Recipe
from app.services.pantry_service import (
    get_pantry_items,
)
from app.services.recipe_service import (
    get_recipes,
)


def calculate_recipe_match(
    recipe: Recipe,
    pantry_ingredient_ids: set[UUID],
) -> dict:
    total_ingredients = len(
        recipe.recipe_ingredients
    )

    matched_ingredients = 0

    missing_ingredients = []


    for recipe_ingredient in (
        recipe.recipe_ingredients
    ):
        ingredient = (
            recipe_ingredient.ingredient
        )

        if (
            ingredient.id
            in pantry_ingredient_ids
        ):
            matched_ingredients += 1

        else:
            missing_ingredients.append(
                {
                    "id": ingredient.id,
                    "name": ingredient.name,
                    "quantity":
                        recipe_ingredient.quantity,
                    "unit":
                        recipe_ingredient.unit,
                }
            )


    if total_ingredients == 0:
        match_percentage = Decimal("0")

    else:
        match_percentage = (
            Decimal(matched_ingredients)
            / Decimal(total_ingredients)
            * Decimal("100")
        ).quantize(
            Decimal("0.01")
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
            matched_ingredients
            == total_ingredients
            and total_ingredients > 0,

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

    recipes = get_recipes(db)


    pantry_ingredient_ids = {
        pantry_item.ingredient_id
        for pantry_item
        in pantry_items

        if pantry_item.quantity > 0
    }


    matches = [
        calculate_recipe_match(
            recipe,
            pantry_ingredient_ids,
        )
        for recipe in recipes
    ]


    matches.sort(
        key=lambda match: (
            match["can_cook"],
            match["match_percentage"],
        ),
        reverse=True,
    )


    return matches