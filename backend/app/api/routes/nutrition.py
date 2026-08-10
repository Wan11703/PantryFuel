from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.api.dependencies.auth import (
    get_current_user,
)
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.nutrition import (
    NutritionGoalResponse,
    NutritionGoalUpsert,
)
from app.services.nutrition_service import (
    get_nutrition_goal,
    upsert_nutrition_goal,
)


router = APIRouter(
    prefix="/nutrition",
    tags=["Nutrition"],
)


@router.get(
    "/goals",
    response_model=NutritionGoalResponse,
)
def read_nutrition_goal(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    nutrition_goal = get_nutrition_goal(
        db,
        current_user.id,
    )

    if nutrition_goal is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nutrition goal not configured.",
        )

    return nutrition_goal


@router.put(
    "/goals",
    response_model=NutritionGoalResponse,
)
def save_nutrition_goal(
    goal_data: NutritionGoalUpsert,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    return upsert_nutrition_goal(
        db,
        current_user.id,
        goal_data,
    )