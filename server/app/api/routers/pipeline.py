from fastapi import APIRouter, Depends, HTTPException, Header
import logging
from uuid import UUID
from app.api.deps import get_pipeline_service
from app.services.pipeline import PipelineService

router = APIRouter()

logger = logging.getLogger("logstash")


@router.post("/pipeline")
async def collect_log(
    data: dict,
    service: PipelineService = Depends(get_pipeline_service),
    api_key: str = Header(..., description="elasticsearch index 연결용 API 키"),
):
    try:
        # Log the incoming data
        result = await service.process_log(data, api_key)
        logger.info("Successfully processed log data")
        return result
    except Exception as e:
        logger.error("Error logging data: %s", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")
