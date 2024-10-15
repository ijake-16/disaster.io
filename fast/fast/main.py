from fastapi import APIRouter, HTTPException, Query, File, UploadFile
from typing import List
from io import BytesIO
import pandas as pd

router = APIRouter(prefix="/main")


@router.get("/")
def read_root():
    return {"Hello": "World"}

