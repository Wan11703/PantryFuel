from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Date,
    DateTime,
    ForeignKey,
    Numeric,
    String,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship,
)

from app.database.base import Base


class MealLog(Base):
    __tablename__ = "meal_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.id",
            ondelete="CASCADE",
        ),
        nullable=False,
        index=True,
    )

    # Nullable because manual meals
    # don't belong to a recipe.
    #
    # SET NULL preserves meal history
    # even if a recipe is deleted later.
    recipe_id: Mapped[
        uuid.UUID | None
    ] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "recipes.id",
            ondelete="SET NULL",
        ),
        nullable=True,
        index=True,
    )

    # recipe | manual
    source: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
    )

    # Snapshot of the name at the
    # time the meal was logged.
    meal_name: Mapped[str] = mapped_column(
        String(160),
        nullable=False,
    )

    # breakfast | lunch |
    # dinner | snack | other
    meal_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="other",
    )

    # Mainly used for recipe logs.
    servings: Mapped[
        Decimal | None
    ] = mapped_column(
        Numeric(8, 2),
        nullable=True,
    )

    # Nutrition snapshot.
    calories: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    protein: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    carbs: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    fat: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
    )

    # The user's nutrition day.
    log_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=date.today,
        index=True,
    )

    logged_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        back_populates="meal_logs"
    )

    recipe: Mapped[
        "Recipe | None"
    ] = relationship(
        back_populates="meal_logs"
    )