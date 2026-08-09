from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.pantry_item import PantryItem
from app.schemas.pantry import (
    PantryItemCreate,
    PantryItemUpdate,
)
from app.services.ingredient_service import (
    get_or_create_ingredient,
    normalize_unit,
)


def get_pantry_items(
    db: Session,
    user_id: UUID,
) -> list[PantryItem]:
    statement = (
        select(PantryItem)
        .options(
            selectinload(
                PantryItem.ingredient
            )
        )
        .where(
            PantryItem.user_id == user_id
        )
        .order_by(
            PantryItem.created_at.desc()
        )
    )

    return list(
        db.scalars(statement).all()
    )


def get_pantry_item(
    db: Session,
    user_id: UUID,
    pantry_item_id: UUID,
) -> PantryItem | None:
    statement = (
        select(PantryItem)
        .options(
            selectinload(
                PantryItem.ingredient
            )
        )
        .where(
            PantryItem.id == pantry_item_id,
            PantryItem.user_id == user_id,
        )
    )

    return db.scalar(statement)


def create_pantry_item(
    db: Session,
    user_id: UUID,
    pantry_data: PantryItemCreate,
) -> PantryItem:
    normalized_unit = normalize_unit(
        pantry_data.unit
    )

    ingredient = get_or_create_ingredient(
        db,
        pantry_data.ingredient_name,
        normalized_unit,
    )

    pantry_item = PantryItem(
        user_id=user_id,
        ingredient_id=ingredient.id,
        quantity=pantry_data.quantity,
        unit=normalized_unit,
        expiration_date=pantry_data.expiration_date,
    )

    pantry_item.ingredient = ingredient

    db.add(pantry_item)

    db.commit()
    db.refresh(pantry_item)

    return pantry_item


def update_pantry_item(
    db: Session,
    pantry_item: PantryItem,
    pantry_data: PantryItemUpdate,
) -> PantryItem:
    fields_set = pantry_data.model_fields_set

    if (
        "ingredient_name" in fields_set
        and pantry_data.ingredient_name is not None
    ):
        ingredient = get_or_create_ingredient(
            db,
            pantry_data.ingredient_name,
            pantry_data.unit
            or pantry_item.unit,
        )

        pantry_item.ingredient_id = ingredient.id
        pantry_item.ingredient = ingredient

    if (
        "quantity" in fields_set
        and pantry_data.quantity is not None
    ):
        pantry_item.quantity = pantry_data.quantity

    if (
        "unit" in fields_set
        and pantry_data.unit is not None
    ):
        pantry_item.unit = normalize_unit(
            pantry_data.unit
        )

    if "expiration_date" in fields_set:
        pantry_item.expiration_date = (
            pantry_data.expiration_date
        )

    db.commit()
    db.refresh(pantry_item)

    return pantry_item


def delete_pantry_item(
    db: Session,
    pantry_item: PantryItem,
) -> None:
    db.delete(pantry_item)
    db.commit()