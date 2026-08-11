from datetime import date, datetime
from decimal import Decimal
from typing import Literal
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


MealType = Literal[
    "breakfast",
    "lunch",
    "dinner",
    "snack",
    "other",
]


class RecipeMealLogCreate(BaseModel):
    recipe_id: UUID

    servings: Decimal = Field(
        gt=0,
        decimal_places=2,
    )

    meal_type: MealType = "other"

    log_date: date | None = None


class ManualMealLogCreate(BaseModel):
    meal_name: str = Field(
        min_length=1,
        max_length=160,
    )

    meal_type: MealType = "other"

    calories: Decimal = Field(
        ge=0,
        decimal_places=2,
    )

    protein: Decimal = Field(
        ge=0,
        decimal_places=2,
    )

    carbs: Decimal = Field(
        ge=0,
        decimal_places=2,
    )

    fat: Decimal = Field(
        ge=0,
        decimal_places=2,
    )

    log_date: date | None = None


class MealLogResponse(BaseModel):
    id: UUID

    recipe_id: UUID | None

    source: str
    meal_name: str
    meal_type: str

    servings: Decimal | None

    calories: Decimal
    protein: Decimal
    carbs: Decimal
    fat: Decimal

    log_date: date
    logged_at: datetime
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )