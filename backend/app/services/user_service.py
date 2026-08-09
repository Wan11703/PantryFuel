from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User
from app.schemas.user import UserCreate


def get_user_by_email(
    db: Session,
    email: str,
) -> User | None:
    normalized_email = email.strip().lower()

    statement = select(User).where(
        User.email == normalized_email
    )

    return db.scalar(statement)


def create_user(
    db: Session,
    user_data: UserCreate,
) -> User:
    user = User(
        email=user_data.email.strip().lower(),
        display_name=user_data.display_name.strip(),
        hashed_password=hash_password(user_data.password),
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user

def get_user_by_id(
    db: Session,
    user_id: UUID,
) -> User | None:
    return db.get(User, user_id)