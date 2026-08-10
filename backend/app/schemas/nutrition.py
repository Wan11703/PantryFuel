from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class NutritionGoalUpsert(BaseModel):
    calories: Decimal = Field(
        gt=0,
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


class NutritionGoalResponse(BaseModel):
    id: UUID

    calories: Decimal
    protein: Decimal
    carbs: Decimal
    fat: Decimal

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )