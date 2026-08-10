from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.recipe import Recipe
from app.models.recipe_ingredient import RecipeIngredient
from app.schemas.recipe import RecipeCreate
from app.services.ingredient_service import (
    get_or_create_ingredient,
    normalize_unit,
)

from decimal import Decimal

from app.utils.nutrition import (
    NutritionCalculationError,
    calculate_nutrition,
)


def get_recipes(
    db: Session,
) -> list[Recipe]:
    statement = (
        select(Recipe)
        .options(
            selectinload(
                Recipe.recipe_ingredients
            ).selectinload(
                RecipeIngredient.ingredient
            )
        )
        .order_by(
            Recipe.created_at.desc()
        )
    )

    return list(
        db.scalars(statement).all()
    )


def get_recipe(
    db: Session,
    recipe_id: UUID,
) -> Recipe | None:
    statement = (
        select(Recipe)
        .options(
            selectinload(
                Recipe.recipe_ingredients
            ).selectinload(
                RecipeIngredient.ingredient
            )
        )
        .where(
            Recipe.id == recipe_id
        )
    )

    return db.scalar(statement)

def calculate_recipe_nutrition(
    recipe: Recipe,
) -> dict:
    total_calories = Decimal("0")
    total_protein = Decimal("0")
    total_carbs = Decimal("0")
    total_fat = Decimal("0")

    missing_ingredients: list[str] = []


    for recipe_ingredient in recipe.recipe_ingredients:
        ingredient = recipe_ingredient.ingredient

        try:
            nutrition = calculate_nutrition(
                ingredient=ingredient,
                quantity=recipe_ingredient.quantity,
                unit=recipe_ingredient.unit,
            )

        except NutritionCalculationError:
            if (
                ingredient.name
                not in missing_ingredients
            ):
                missing_ingredients.append(
                    ingredient.name
                )

            continue


        total_calories += nutrition[
            "calories"
        ]

        total_protein += nutrition[
            "protein"
        ]

        total_carbs += nutrition[
            "carbs"
        ]

        total_fat += nutrition[
            "fat"
        ]


    # Do not return misleading partial totals.
    if missing_ingredients:
        return {
            "recipe_id": recipe.id,
            "recipe_name": recipe.name,
            "servings": recipe.servings,

            "nutrition_available": False,

            "missing_ingredients":
                missing_ingredients,

            "total": None,
            "per_serving": None,
        }


    servings = Decimal(
        str(recipe.servings)
    )

    total = {
        "calories":
            total_calories.quantize(
                Decimal("0.01")
            ),

        "protein":
            total_protein.quantize(
                Decimal("0.01")
            ),

        "carbs":
            total_carbs.quantize(
                Decimal("0.01")
            ),

        "fat":
            total_fat.quantize(
                Decimal("0.01")
            ),
    }


    per_serving = {
        "calories":
            (
                total_calories
                / servings
            ).quantize(
                Decimal("0.01")
            ),

        "protein":
            (
                total_protein
                / servings
            ).quantize(
                Decimal("0.01")
            ),

        "carbs":
            (
                total_carbs
                / servings
            ).quantize(
                Decimal("0.01")
            ),

        "fat":
            (
                total_fat
                / servings
            ).quantize(
                Decimal("0.01")
            ),
    }


    return {
        "recipe_id": recipe.id,
        "recipe_name": recipe.name,
        "servings": recipe.servings,

        "nutrition_available": True,
        "missing_ingredients": [],

        "total": total,
        "per_serving": per_serving,
    }


def create_recipe(
    db: Session,
    recipe_data: RecipeCreate,
) -> Recipe:
    recipe = Recipe(
        name=recipe_data.name.strip(),
        description=(
            recipe_data.description.strip()
            if recipe_data.description
            else None
        ),
        instructions=recipe_data.instructions.strip(),
        servings=recipe_data.servings,
        prep_minutes=recipe_data.prep_minutes,
        cook_minutes=recipe_data.cook_minutes,
    )

    db.add(recipe)

    # Generates recipe.id before creating child rows.
    db.flush()

    for position, ingredient_data in enumerate(
        recipe_data.ingredients
    ):
        normalized_unit = normalize_unit(
            ingredient_data.unit
        )

        ingredient = get_or_create_ingredient(
            db,
            ingredient_data.ingredient_name,
            normalized_unit,
        )

        recipe_ingredient = RecipeIngredient(
            recipe_id=recipe.id,
            ingredient_id=ingredient.id,
            quantity=ingredient_data.quantity,
            unit=normalized_unit,
            position=position,
        )

        recipe_ingredient.ingredient = ingredient

        recipe.recipe_ingredients.append(
            recipe_ingredient
        )

    db.commit()

    created_recipe = get_recipe(
        db,
        recipe.id,
    )

    if created_recipe is None:
        raise RuntimeError(
            "Recipe was created but could not be reloaded."
        )

    return created_recipe