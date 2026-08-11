from datetime import datetime
from uuid import UUID

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
)


class IngredientAliasCreate(BaseModel):
    canonical_name: str = Field(
        min_length=1,
        max_length=120,
    )

    alias_name: str = Field(
        min_length=1,
        max_length=120,
    )


class IngredientAliasResponse(BaseModel):
    id: UUID
    alias_name: str
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )


class IngredientWithAliasesResponse(BaseModel):
    id: UUID
    name: str
    category: str | None
    default_unit: str

    aliases: list[
        IngredientAliasResponse
    ]

    model_config = ConfigDict(
        from_attributes=True
    )


class IngredientResolveResponse(BaseModel):
    input_name: str
    resolved: bool

    ingredient_id: UUID | None
    canonical_name: str | None