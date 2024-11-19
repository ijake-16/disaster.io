# pylint: disable=missing-module-docstring, missing-function-docstring, missing-class-docstring, too-few-public-methods

import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Database
from . import host, player

engine = None


@asynccontextmanager
async def lifespan(_: FastAPI):
    await Database.init()
    yield
    await Database.close()


app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(host.router)
app.include_router(player.router)

load_dotenv()


class EndpointFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return record.getMessage().find("/healthy") == -1


# Filter out /endpoint
logging.getLogger("uvicorn.access").addFilter(EndpointFilter())


@app.get("/healthy")
async def healthy() -> dict:
    return {"status": "ok"}
