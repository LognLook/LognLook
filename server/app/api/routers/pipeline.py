from fastapi import APIRouter, Depends, HTTPException
import logging
from app.core.config.dependencies import get_pipeline_service
from app.services.pipeline import PipelineService

router = APIRouter()

logger = logging.getLogger("logstash")


@router.post("/log")
def collect_log(data: dict, service: PipelineService = Depends(get_pipeline_service)):
    # TODO: project_id 추가 , api 키 요청
    try:
        # Log the incoming data
        result = service.process_log(data)
        logger.info("Successfully processed log data")
        return result
    except Exception as e:
        logger.error("Error logging data: %s", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")
