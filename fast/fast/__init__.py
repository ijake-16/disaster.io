# pylint: disable=missing-module-docstring, missing-function-docstring, missing-class-docstring, too-few-public-methods

import logging
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from . import host
from . import player
from . import auth
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


engine = None

# Load environment variables
load_dotenv()

app = FastAPI()

# Add CORS middleware with appropriate settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8080"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(host.router)
app.include_router(player.router)
app.include_router(auth.router)


class EndpointFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return record.getMessage().find("/healthy") == -1


# Filter out /endpoint
logging.getLogger("uvicorn.access").addFilter(EndpointFilter())


@app.get("/healthy")
async def healthy() -> dict:
    return {"status": "ok"}