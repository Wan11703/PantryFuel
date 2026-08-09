from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Response,
    status,
)
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.database.dependencies import get_db
from app.models.user import User
from app.schemas.pantry import (
    PantryItemCreate,
    PantryItemResponse,
    PantryItemUpdate,
)
from app.services.pantry_service import (
    create_pantry_item,
    delete_pantry_item,
    get_pantry_item,
    get_pantry_items,
    update_pantry_item,
)


router = APIRouter(
    prefix="/pantry",
    tags=["Pantry"],
)


@router.post(
    "",
    response_model=PantryItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_pantry_item(
    pantry_data: PantryItemCreate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    return create_pantry_item(
        db,
        current_user.id,
        pantry_data,
    )


@router.get(
    "",
    response_model=list[PantryItemResponse],
)
def list_pantry_items(
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    return get_pantry_items(
        db,
        current_user.id,
    )


@router.get(
    "/{pantry_item_id}",
    response_model=PantryItemResponse,
)
def read_pantry_item(
    pantry_item_id: UUID,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    pantry_item = get_pantry_item(
        db,
        current_user.id,
        pantry_item_id,
    )

    if pantry_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pantry item not found.",
        )

    return pantry_item


@router.put(
    "/{pantry_item_id}",
    response_model=PantryItemResponse,
)
def edit_pantry_item(
    pantry_item_id: UUID,
    pantry_data: PantryItemUpdate,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    pantry_item = get_pantry_item(
        db,
        current_user.id,
        pantry_item_id,
    )

    if pantry_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pantry item not found.",
        )

    return update_pantry_item(
        db,
        pantry_item,
        pantry_data,
    )


@router.delete(
    "/{pantry_item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_pantry_item(
    pantry_item_id: UUID,
    current_user: User = Depends(
        get_current_user
    ),
    db: Session = Depends(get_db),
):
    pantry_item = get_pantry_item(
        db,
        current_user.id,
        pantry_item_id,
    )

    if pantry_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pantry item not found.",
        )

    delete_pantry_item(
        db,
        pantry_item,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT
    )