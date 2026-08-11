from datetime import date
from decimal import Decimal
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.meal_log import MealLog

from app.schemas.meal_log import (
    ManualMealLogCreate,
    RecipeMealLogCreate,
)

from app.services.recipe_service import (
    calculate_recipe_nutrition,
    get_recipe,
)


MONEY_PRECISION = Decimal("0.01")


class MealLogError(ValueError):
    pass


class RecipeNotFoundError(
    MealLogError
):
    pass


class RecipeNutritionUnavailableError(
    MealLogError
):
    pass


def round_macro(
    value: Decimal,
) -> Decimal:
    return value.quantize(
        MONEY_PRECISION
    )


def create_recipe_meal_log(
    db: Session,
    user_id: UUID,
    data: RecipeMealLogCreate,
) -> MealLog:
    recipe = get_recipe(
        db,
        data.recipe_id,
    )


    if recipe is None:
        raise RecipeNotFoundError(
            "Recipe not found."
        )


    nutrition = (
        calculate_recipe_nutrition(
            recipe
        )
    )


    if (
        not nutrition[
            "nutrition_available"
        ]
        or nutrition[
            "per_serving"
        ] is None
    ):
        missing = nutrition[
            "missing_ingredients"
        ]

        missing_text = ", ".join(
            missing
        )

        raise (
            RecipeNutritionUnavailableError(
                "Recipe nutrition is "
                "unavailable"
                + (
                    f" for: {missing_text}."
                    if missing_text
                    else "."
                )
            )
        )


    per_serving = nutrition[
        "per_serving"
    ]

    servings = data.servings


    log = MealLog(
        user_id=user_id,

        recipe_id=recipe.id,

        source="recipe",

        # Snapshot so history stays
        # readable even if the recipe
        # name changes later.
        meal_name=recipe.name,

        meal_type=data.meal_type,

        servings=servings,

        calories=round_macro(
            per_serving[
                "calories"
            ]
            * servings
        ),

        protein=round_macro(
            per_serving[
                "protein"
            ]
            * servings
        ),

        carbs=round_macro(
            per_serving[
                "carbs"
            ]
            * servings
        ),

        fat=round_macro(
            per_serving[
                "fat"
            ]
            * servings
        ),

        log_date=(
            data.log_date
            or date.today()
        ),
    )


    db.add(
        log
    )

    db.commit()

    db.refresh(
        log
    )

    return log


def create_manual_meal_log(
    db: Session,
    user_id: UUID,
    data: ManualMealLogCreate,
) -> MealLog:
    log = MealLog(
        user_id=user_id,

        recipe_id=None,

        source="manual",

        meal_name=(
            data.meal_name
            .strip()
        ),

        meal_type=data.meal_type,

        servings=None,

        calories=round_macro(
            data.calories
        ),

        protein=round_macro(
            data.protein
        ),

        carbs=round_macro(
            data.carbs
        ),

        fat=round_macro(
            data.fat
        ),

        log_date=(
            data.log_date
            or date.today()
        ),
    )


    db.add(
        log
    )

    db.commit()

    db.refresh(
        log
    )

    return log


def get_meal_logs_for_date(
    db: Session,
    user_id: UUID,
    log_date: date,
) -> list[MealLog]:
    statement = (
        select(MealLog)
        .where(
            MealLog.user_id
            == user_id,

            MealLog.log_date
            == log_date,
        )
        .order_by(
            MealLog.logged_at.desc()
        )
    )


    return list(
        db.scalars(
            statement
        ).all()
    )


def get_today_meal_logs(
    db: Session,
    user_id: UUID,
) -> list[MealLog]:
    return get_meal_logs_for_date(
        db,
        user_id,
        date.today(),
    )


def delete_meal_log(
    db: Session,
    user_id: UUID,
    log_id: UUID,
) -> bool:
    statement = (
        select(MealLog)
        .where(
            MealLog.id
            == log_id,

            MealLog.user_id
            == user_id,
        )
    )


    log = db.scalar(
        statement
    )


    if log is None:
        return False


    db.delete(
        log
    )

    db.commit()

    return True