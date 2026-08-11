from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query,
    status,
)
from sqlalchemy.orm import Session

from app.api.dependencies.auth import (
    get_current_user,
)
from app.database.dependencies import (
    get_db,
)
from app.models.user import User
from app.schemas.ingredient import (
    IngredientAliasCreate,
    IngredientAliasResponse,
    IngredientResolveResponse,
    IngredientWithAliasesResponse,
)
from app.services.ingredient_service import (
    create_ingredient_alias,
    delete_ingredient_alias,
    get_ingredients_with_aliases,
    resolve_ingredient,
)


router = APIRouter(
    prefix="/ingredients",
    tags=["Ingredients"],
)


@router.get(
    "",
    response_model=list[
        IngredientWithAliasesResponse
    ],
)
def list_ingredients(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    return get_ingredients_with_aliases(
        db
    )


@router.get(
    "/resolve",
    response_model=IngredientResolveResponse,
)
def resolve_ingredient_name(
    name: str = Query(
        min_length=1
    ),
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    ingredient = resolve_ingredient(
        db,
        name,
    )


    if ingredient is None:
        return {
            "input_name": name,
            "resolved": False,
            "ingredient_id": None,
            "canonical_name": None,
        }


    return {
        "input_name": name,
        "resolved": True,
        "ingredient_id":
            ingredient.id,

        "canonical_name":
            ingredient.name,
    }


@router.post(
    "/aliases",
    response_model=IngredientAliasResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_alias(
    alias_data: IngredientAliasCreate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    try:
        return create_ingredient_alias(
            db=db,
            canonical_name=(
                alias_data.canonical_name
            ),
            alias_name=(
                alias_data.alias_name
            ),
        )

    except ValueError as error:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(error),
        ) from error


@router.delete(
    "/aliases/{alias_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_alias(
    alias_id: UUID,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(
        get_db
    ),
):
    deleted = (
        delete_ingredient_alias(
            db,
            alias_id,
        )
    )


    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Ingredient alias not found.",
        )