from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
)
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.recipe import (
    RecipeCreate,
    RecipeNutritionResponse,
    RecipeResponse,
)

from app.services.recipe_service import (
    calculate_recipe_nutrition,
    create_recipe,
    get_recipe,
    get_recipes,
)




router = APIRouter(
    prefix="/recipes",
    tags=["Recipes"],
)


@router.post(
    "",
    response_model=RecipeResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_recipe(
    recipe_data: RecipeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return create_recipe(
        db,
        recipe_data,
    )


@router.get(
    "",
    response_model=list[RecipeResponse],
)
def list_recipes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return get_recipes(db)


@router.get(
    "/{recipe_id}",
    response_model=RecipeResponse,
)
def read_recipe(
    recipe_id: UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    recipe = get_recipe(
        db,
        recipe_id,
    )

    if recipe is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found.",
        )

    return recipe

@router.get(
    "/{recipe_id}/nutrition",
    response_model=RecipeNutritionResponse,
)
def read_recipe_nutrition(
    recipe_id: UUID,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    recipe = get_recipe(
        db,
        recipe_id,
    )

    if recipe is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Recipe not found.",
        )

    return calculate_recipe_nutrition(
        recipe
    )