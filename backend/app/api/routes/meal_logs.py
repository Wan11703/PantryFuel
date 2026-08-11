from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session
from uuid import UUID

from app.api.dependencies.auth import (
    get_current_user,
)
from app.database.dependencies import (
    get_db,
)
from app.models.user import User

from app.schemas.meal_log import (
    ManualMealLogCreate,
    MealLogResponse,
    RecipeMealLogCreate,
)

from app.services.meal_log_service import (
    RecipeNotFoundError,
    RecipeNutritionUnavailableError,
    create_manual_meal_log,
    create_recipe_meal_log,
    delete_meal_log,
    get_today_meal_logs,
)


router = APIRouter(
    prefix="/nutrition/logs",
    tags=["Nutrition"],
)


@router.post(
    "/recipe",
    response_model=MealLogResponse,
    status_code=status.HTTP_201_CREATED,
)
def log_recipe_meal(
    data: RecipeMealLogCreate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    try:
        return create_recipe_meal_log(
            db=db,
            user_id=current_user.id,
            data=data,
        )

    except RecipeNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(error),
        ) from error

    except (
        RecipeNutritionUnavailableError
    ) as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.post(
    "/manual",
    response_model=MealLogResponse,
    status_code=status.HTTP_201_CREATED,
)
def log_manual_meal(
    data: ManualMealLogCreate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    return create_manual_meal_log(
        db=db,
        user_id=current_user.id,
        data=data,
    )


# Keep this fixed path before
# /{log_id}.
@router.get(
    "/today",
    response_model=list[
        MealLogResponse
    ],
)
def list_today_meals(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    return get_today_meal_logs(
        db,
        current_user.id,
    )


@router.delete(
    "/{log_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_meal_log(
    log_id: UUID,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    deleted = delete_meal_log(
        db=db,
        user_id=current_user.id,
        log_id=log_id,
    )


    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meal log not found.",
        )