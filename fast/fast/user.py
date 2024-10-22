# pylint: disable=missing-module-docstring, missing-function-docstring, missing-class-docstring

from fastapi import APIRouter, Depends, Response
from fastapi_login import LoginManager
from fastapi_login.exceptions import InvalidCredentialsException
from sqlalchemy import select

from .env import get_env
from .database import Database, User, UserEditForm, UserResponse, UserForm

manager = LoginManager(
    get_env("SECRET"), "/api/login", use_cookie=True, use_header=False
)


@manager.user_loader()
async def query_user(username: str) -> User | None:
    async with Database.async_session() as session:
        stmt = select(User).where(User.username == username)
        res = (await session.execute(stmt)).scalar()
        await session.commit()
        return res


router = APIRouter(prefix="/auth")


@router.post("/login")
async def login(response: Response, form: UserForm) -> str:
    user = await query_user(form.username)
    if not user:
        raise InvalidCredentialsException
    if not user.password == form.password:
        raise InvalidCredentialsException

    access_token = manager.create_access_token(data={"sub": form.username})
    response.set_cookie(manager.cookie_name, access_token, httponly=True)
    return access_token


@router.post("/logout")
async def logout(response: Response) -> dict:
    response.delete_cookie(manager.cookie_name)
    return {"status": "ok"}


@router.get("/me")
async def my_info(user: User = Depends(manager)) -> UserResponse:
    return user.to_response()


@router.post("/register")
async def register(data: UserForm) -> UserResponse:
    async with Database.async_session() as session:
        stmt = select(User).where(User.username == data.username)
        res = (await session.execute(stmt)).scalar()
        if res:
            raise InvalidCredentialsException

        user = data.to_user()
        session.add(user)
        await session.commit()

    return user.to_response()


@router.delete("/")
async def delete_user(user: User = Depends(manager)) -> dict:
    async with Database.async_session() as session:
        stmt = select(User).where(User.username == user.username)
        res = (await session.execute(stmt)).scalar()
        if not res:
            raise InvalidCredentialsException

        await session.delete(res)
        await session.commit()

    return {"status": "ok"}


@router.put("/password")
async def change_password(
    current: str, password: str, user: User = Depends(manager)
) -> UserResponse:
    async with Database.async_session() as session:
        stmt = select(User).where(User.username == user.username)
        res = (await session.execute(stmt)).scalar()
        if not res:
            raise InvalidCredentialsException
        if not res.password == current:
            raise InvalidCredentialsException

        res.password = password
        await session.commit()

    return res.to_response()


@router.put("/info")
async def edit_info(info: UserEditForm, user: User = Depends(manager)) -> UserResponse:
    async with Database.async_session() as session:
        stmt = select(User).where(User.username == user.username)
        res = (await session.execute(stmt)).scalar()
        if not res:
            raise InvalidCredentialsException

        if info.profile_img:
            res.profile_img = info.profile_img
        if info.nickname:
            res.nickname = info.nickname
        await session.commit()

    return res.to_response()
