from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.ingredient import Ingredient


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

    statement = select(Ingredient).where(
        Ingredient.name == normalized_name
    )

    return db.scalar(statement)


def get_or_create_ingredient(
    db: Session,
    name: str,
    default_unit: str,
) -> Ingredient:
    normalized_name = normalize_ingredient_name(
        name
    )

    normalized_unit = normalize_unit(
        default_unit
    )

    existing_ingredient = get_ingredient_by_name(
        db,
        normalized_name,
    )

    if existing_ingredient:
        return existing_ingredient

    ingredient = Ingredient(
        name=normalized_name,
        default_unit=normalized_unit,
    )

    db.add(ingredient)

    # Generate the ingredient ID without
    # committing the transaction yet.
    db.flush()

    return ingredient