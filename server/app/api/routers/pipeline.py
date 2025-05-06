from fastapi import APIRouter, Depends, HTTPException
import logging
from app.crud.pipeline import process_log


router = APIRouter()

logger = logging.getLogger("logstash")

@router.post("/log")
def collect_log(data: dict):
    try:
        # Log the incoming data
        result = process_log(data)
        logger.info("Successfully processed log data")
        return result
    except Exception as e:
        logger.error("Error logging data: %s", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")
