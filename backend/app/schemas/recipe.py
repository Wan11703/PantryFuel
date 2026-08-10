from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


class RecipeIngredientCreate(BaseModel):
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


class RecipeCreate(BaseModel):
    name: str = Field(
        min_length=1,
        max_length=160,
    )

    description: str | None = None

    instructions: str = Field(
        min_length=1,
    )

    servings: int = Field(
        ge=1,
    )

    prep_minutes: int = Field(
        ge=0,
    )

    cook_minutes: int = Field(
        ge=0,
    )

    ingredients: list[
        RecipeIngredientCreate
    ] = Field(
        min_length=1,
    )


class RecipeIngredientDetail(BaseModel):
    id: UUID
    name: str
    category: str | None
    default_unit: str

    model_config = ConfigDict(
        from_attributes=True
    )


class RecipeIngredientResponse(BaseModel):
    id: UUID
    quantity: Decimal
    unit: str
    position: int

    ingredient: RecipeIngredientDetail

    model_config = ConfigDict(
        from_attributes=True
    )


class MacroTotals(BaseModel):
    calories: Decimal
    protein: Decimal
    carbs: Decimal
    fat: Decimal


class RecipeNutritionResponse(BaseModel):
    recipe_id: UUID
    recipe_name: str
    servings: int

    nutrition_available: bool
    missing_ingredients: list[str]

    total: MacroTotals | None
    per_serving: MacroTotals | None

class MissingIngredientResponse(BaseModel):
    id: UUID
    name: str
    quantity: Decimal
    unit: str


class RecipeMatchResponse(BaseModel):
    recipe: RecipeResponse

    total_ingredients: int
    matched_ingredients: int
    match_percentage: Decimal

    can_cook: bool

    missing_ingredients: list[
        MissingIngredientResponse
    ]


class RecipeResponse(BaseModel):
    id: UUID

    name: str
    description: str | None
    instructions: str

    servings: int
    prep_minutes: int
    cook_minutes: int

    recipe_ingredients: list[
        RecipeIngredientResponse
    ]

    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )