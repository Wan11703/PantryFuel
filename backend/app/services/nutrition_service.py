from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.nutrition_goal import NutritionGoal
from app.schemas.nutrition import NutritionGoalUpsert


def get_nutrition_goal(
    db: Session,
    user_id: UUID,
) -> NutritionGoal | None:
    statement = select(
        NutritionGoal
    ).where(
        NutritionGoal.user_id == user_id
    )

    return db.scalar(statement)


def upsert_nutrition_goal(
    db: Session,
    user_id: UUID,
    goal_data: NutritionGoalUpsert,
) -> NutritionGoal:
    nutrition_goal = get_nutrition_goal(
        db,
        user_id,
    )

    if nutrition_goal is None:
        nutrition_goal = NutritionGoal(
            user_id=user_id,
            calories=goal_data.calories,
            protein=goal_data.protein,
            carbs=goal_data.carbs,
            fat=goal_data.fat,
        )

        db.add(nutrition_goal)

    else:
        nutrition_goal.calories = (
            goal_data.calories
        )

        nutrition_goal.protein = (
            goal_data.protein
        )

        nutrition_goal.carbs = (
            goal_data.carbs
        )

        nutrition_goal.fat = (
            goal_data.fat
        )

    db.commit()
    db.refresh(nutrition_goal)

    return nutrition_goal