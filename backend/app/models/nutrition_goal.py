import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Numeric,
    func,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class NutritionGoal(Base):
    __tablename__ = "nutrition_goals"

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
        unique=True,
        nullable=False,
        index=True,
    )

    calories: Mapped[Decimal] = mapped_column(
        Numeric(8, 2),
        nullable=False,
    )

    protein: Mapped[Decimal] = mapped_column(
        Numeric(8, 2),
        nullable=False,
    )

    carbs: Mapped[Decimal] = mapped_column(
        Numeric(8, 2),
        nullable=False,
    )

    fat: Mapped[Decimal] = mapped_column(
        Numeric(8, 2),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    user: Mapped["User"] = relationship(
        back_populates="nutrition_goal",
    )