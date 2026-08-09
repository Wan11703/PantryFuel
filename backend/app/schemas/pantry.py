from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class IngredientResponse(BaseModel):
    id: UUID
    name: str
    category: str | None
    default_unit: str

    model_config = ConfigDict(
        from_attributes=True
    )


class PantryItemCreate(BaseModel):
    ingredient_name: str = Field(
        min_length=1,
        max_length=120,
    )

    quantity: Decimal = Field(
        gt=0,
    )

    unit: str = Field(
        min_length=1,
        max_length=20,
    )

    expiration_date: date | None = None


class PantryItemUpdate(BaseModel):
    ingredient_name: str | None = Field(
        default=None,
        min_length=1,
        max_length=120,
    )

    quantity: Decimal | None = Field(
        default=None,
        gt=0,
    )

    unit: str | None = Field(
        default=None,
        min_length=1,
        max_length=20,
    )

    expiration_date: date | None = None


class PantryItemResponse(BaseModel):
    id: UUID

    quantity: float
    unit: str
    expiration_date: date | None

    ingredient: IngredientResponse

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )