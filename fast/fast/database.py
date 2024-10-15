# pylint: disable=invalid-name, broad-exception-raised, broad-exception-caught, missing-function-docstring
# pylint: disable=missing-module-docstring, missing-class-docstring, too-few-public-methods

import asyncio

from sqlalchemy.ext.asyncio import (
    AsyncAttrs,
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from pydantic import BaseModel

from .env import get_env


class Base(AsyncAttrs, DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    user_id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(unique=True, index=True)
    password: Mapped[str]
    nickname: Mapped[str | None]
    profile_img: Mapped[str | None]

    def to_response(self) -> "UserResponse":
        return UserResponse(
            user_id=self.user_id,
            username=self.username,
            nickname=self.nickname,
            profile_img=self.profile_img,
        )


class UserForm(BaseModel):
    username: str
    password: str

    def to_user(self) -> User:
        return User(
            username=self.username,
            password=self.password,
        )


class UserEditForm(BaseModel):
    nickname: str | None
    profile_img: str | None


class UserResponse(BaseModel):
    user_id: int
    username: str
    nickname: str | None
    profile_img: str | None


class Database:
    """
    Database class
    """

    engine: AsyncEngine | None
    async_session: async_sessionmaker[AsyncSession]

    @classmethod
    async def init(cls) -> None:
        """
        This initializes the database

        This should be called before using the database
        """
        if hasattr(cls, "engine") and cls.engine is not None:
            return

        username = get_env("SQL_USER")
        password = get_env("SQL_PASSWORD")
        url = get_env("SQL_URL")
        db = get_env("SQL_DB")

        for _ in range(int(get_env("SQL_RETRY"))):
            try:
                print("Connecting to database...")
                engine = create_async_engine(
                    f"postgresql+asyncpg://{username}:{password}@{url}/{db}", echo=True
                )
                async with engine.begin() as conn:
                    await conn.run_sync(Base.metadata.create_all)
                break
            except KeyboardInterrupt as err:
                raise KeyboardInterrupt from err
            except Exception:
                print("Failed to connect to database, retrying...")
                await asyncio.sleep(5)
        else:
            raise Exception("Unable to connect to database")
        cls.engine = engine
        cls.async_session = async_sessionmaker(cls.engine, expire_on_commit=False)

    @classmethod
    async def close(cls) -> None:
        """
        This closes the connection to the database
        """
        if hasattr(cls, "engine") and cls.engine is not None:
            await cls.engine.dispose()
