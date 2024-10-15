# pylint: disable=missing-module-docstring, missing-function-docstring, missing-class-docstring, too-few-public-methods

import logging
from contextlib import asynccontextmanager

import dotenv
from fastapi import FastAPI

from .database import Database
from . import user, main

engine = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    await Database.init()
    yield
    await Database.close()


app = FastAPI(lifespan=lifespan)
app.include_router(user.router)
app.include_router(main.router)

dotenv.load_dotenv()


class EndpointFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return record.getMessage().find("/healthy") == -1


# Filter out /endpoint
logging.getLogger("uvicorn.access").addFilter(EndpointFilter())


@app.get("/healthy")
async def healthy() -> dict:
    return {"status": "ok"}
