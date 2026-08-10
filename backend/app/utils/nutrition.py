from decimal import Decimal

from app.models.ingredient import Ingredient


class NutritionCalculationError(
    ValueError
):
    pass


def convert_quantity_to_grams(
    quantity: Decimal,
    unit: str,
    ingredient: Ingredient,
) -> Decimal:
    normalized_unit = (
        unit.strip().lower()
    )

    if quantity <= 0:
        raise NutritionCalculationError(
            "Quantity must be greater than 0."
        )

    if normalized_unit == "g":
        return quantity

    if normalized_unit == "kg":
        return (
            quantity
            * Decimal("1000")
        )

    if normalized_unit == "piece":
        if ingredient.grams_per_piece is None:
            raise NutritionCalculationError(
                "Ingredient has no grams-per-piece conversion."
            )

        return (
            quantity
            * ingredient.grams_per_piece
        )

    if normalized_unit == "ml":
        if ingredient.grams_per_ml is None:
            raise NutritionCalculationError(
                "Ingredient has no grams-per-ml conversion."
            )

        return (
            quantity
            * ingredient.grams_per_ml
        )

    if normalized_unit == "l":
        if ingredient.grams_per_ml is None:
            raise NutritionCalculationError(
                "Ingredient has no grams-per-ml conversion."
            )

        return (
            quantity
            * Decimal("1000")
            * ingredient.grams_per_ml
        )

    raise NutritionCalculationError(
        f"Unsupported unit: {unit}"
    )


def calculate_nutrition(
    ingredient: Ingredient,
    quantity: Decimal,
    unit: str,
) -> dict[str, Decimal]:
    if (
        ingredient.calories_per_100g is None
        or ingredient.protein_per_100g is None
        or ingredient.carbs_per_100g is None
        or ingredient.fat_per_100g is None
    ):
        raise NutritionCalculationError(
            "Ingredient nutrition data is incomplete."
        )

    grams = convert_quantity_to_grams(
        quantity,
        unit,
        ingredient,
    )

    multiplier = (
        grams / Decimal("100")
    )

    return {
        "grams": grams,

        "calories": (
            ingredient.calories_per_100g
            * multiplier
        ),

        "protein": (
            ingredient.protein_per_100g
            * multiplier
        ),

        "carbs": (
            ingredient.carbs_per_100g
            * multiplier
        ),

        "fat": (
            ingredient.fat_per_100g
            * multiplier
        ),
    }