from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import (
    Session,
    selectinload,
)

from app.models.ingredient import Ingredient
from app.models.ingredient_alias import IngredientAlias


def normalize_ingredient_name(
    name: str,
) -> str:
    return " ".join(
        name.strip().lower().split()
    )


def normalize_unit(
    unit: str,
) -> str:
    unit = unit.strip().lower()

    aliases = {
        "gram": "g",
        "grams": "g",
        "g": "g",

        "kilogram": "kg",
        "kilograms": "kg",
        "kgs": "kg",
        "kg": "kg",

        "milliliter": "ml",
        "milliliters": "ml",
        "millilitre": "ml",
        "millilitres": "ml",
        "ml": "ml",

        "liter": "l",
        "liters": "l",
        "litre": "l",
        "litres": "l",
        "l": "l",

        "piece": "piece",
        "pieces": "piece",
        "pcs": "piece",
        "pc": "piece",
    }

    return aliases.get(
        unit,
        unit,
    )


def get_ingredient_by_name(
    db: Session,
    name: str,
) -> Ingredient | None:
    normalized_name = normalize_ingredient_name(
        name
    )

    statement = select(
        Ingredient
    ).where(
        Ingredient.name
        == normalized_name
    )

    return db.scalar(
        statement
    )


def get_ingredient_by_alias(
    db: Session,
    alias_name: str,
) -> Ingredient | None:
    normalized_alias = (
        normalize_ingredient_name(
            alias_name
        )
    )

    statement = (
        select(Ingredient)
        .join(
            IngredientAlias,
            IngredientAlias.ingredient_id
            == Ingredient.id,
        )
        .where(
            IngredientAlias.alias_name
            == normalized_alias
        )
    )

    return db.scalar(
        statement
    )


def resolve_ingredient(
    db: Session,
    name: str,
) -> Ingredient | None:
    normalized_name = (
        normalize_ingredient_name(
            name
        )
    )

    # First try the canonical
    # ingredient name.
    ingredient = (
        get_ingredient_by_name(
            db,
            normalized_name,
        )
    )

    if ingredient is not None:
        return ingredient


    # If no canonical ingredient
    # exists, try known aliases.
    ingredient = (
        get_ingredient_by_alias(
            db,
            normalized_name,
        )
    )

    if ingredient is not None:
        return ingredient


    return None


def get_or_create_ingredient(
    db: Session,
    name: str,
    default_unit: str,
) -> Ingredient:
    normalized_name = (
        normalize_ingredient_name(
            name
        )
    )

    normalized_unit = (
        normalize_unit(
            default_unit
        )
    )


    # This now checks BOTH:
    #
    # 1. Canonical ingredient names
    # 2. Ingredient aliases
    existing_ingredient = (
        resolve_ingredient(
            db,
            normalized_name,
        )
    )


    if existing_ingredient is not None:
        return existing_ingredient


    ingredient = Ingredient(
        name=normalized_name,
        default_unit=normalized_unit,
    )

    db.add(
        ingredient
    )

    # Generate the ingredient ID
    # without committing yet.
    db.flush()

    return ingredient


def get_alias_by_name(
    db: Session,
    alias_name: str,
) -> IngredientAlias | None:
    normalized_alias = (
        normalize_ingredient_name(
            alias_name
        )
    )

    statement = select(
        IngredientAlias
    ).where(
        IngredientAlias.alias_name
        == normalized_alias
    )

    return db.scalar(
        statement
    )


def add_ingredient_alias(
    db: Session,
    ingredient: Ingredient,
    alias_name: str,
) -> IngredientAlias:
    normalized_alias = (
        normalize_ingredient_name(
            alias_name
        )
    )


    if not normalized_alias:
        raise ValueError(
            "Alias name cannot be empty."
        )


    # No reason to create:
    #
    # oats -> oats
    if (
        normalized_alias
        == ingredient.name
    ):
        raise ValueError(
            "Alias is already the canonical ingredient name."
        )


    # Prevent something like:
    #
    # canonical ingredient:
    # milk
    #
    # alias for another ingredient:
    # milk
    canonical_conflict = (
        get_ingredient_by_name(
            db,
            normalized_alias,
        )
    )


    if canonical_conflict is not None:
        raise ValueError(
            "Alias already exists as a canonical ingredient."
        )


    existing_alias = (
        get_alias_by_name(
            db,
            normalized_alias,
        )
    )


    if existing_alias is not None:

        # Alias is already connected
        # to this exact ingredient.
        if (
            existing_alias.ingredient_id
            == ingredient.id
        ):
            return existing_alias


        # Alias belongs to a different
        # canonical ingredient.
        raise ValueError(
            "Alias already belongs to another ingredient."
        )


    alias = IngredientAlias(
        ingredient_id=ingredient.id,
        alias_name=normalized_alias,
    )

    db.add(
        alias
    )

    db.flush()

    return alias

def get_ingredients_with_aliases(
    db: Session,
) -> list[Ingredient]:
    statement = (
        select(Ingredient)
        .options(
            selectinload(
                Ingredient.aliases
            )
        )
        .order_by(
            Ingredient.name.asc()
        )
    )

    return list(
        db.scalars(
            statement
        ).all()
    )


def get_ingredient_by_id(
    db: Session,
    ingredient_id: UUID,
) -> Ingredient | None:
    statement = (
        select(Ingredient)
        .options(
            selectinload(
                Ingredient.aliases
            )
        )
        .where(
            Ingredient.id
            == ingredient_id
        )
    )

    return db.scalar(
        statement
    )


def create_ingredient_alias(
    db: Session,
    canonical_name: str,
    alias_name: str,
) -> IngredientAlias:
    canonical_ingredient = (
        get_ingredient_by_name(
            db,
            canonical_name,
        )
    )

    if canonical_ingredient is None:
        raise ValueError(
            "Canonical ingredient does not exist."
        )


    alias = add_ingredient_alias(
        db,
        canonical_ingredient,
        alias_name,
    )


    db.commit()

    db.refresh(
        alias
    )

    return alias


def delete_ingredient_alias(
    db: Session,
    alias_id: UUID,
) -> bool:
    statement = select(
        IngredientAlias
    ).where(
        IngredientAlias.id
        == alias_id
    )

    alias = db.scalar(
        statement
    )


    if alias is None:
        return False


    db.delete(
        alias
    )

    db.commit()

    return True