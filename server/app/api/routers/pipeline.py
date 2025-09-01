from fastapi import APIRouter, Depends, HTTPException, Header
import logging
import asyncio
from collections import deque
from datetime import datetime
from typing import Dict, List
from uuid import UUID
from app.api.deps import get_pipeline_service
from app.services.pipeline import PipelineService

router = APIRouter()

logger = logging.getLogger("logstash")

# 배치 처리를 위한 큐와 설정
log_batch_queue: deque = deque()
BATCH_SIZE = 50  # 배치 크기
BATCH_TIMEOUT = 5.0  # 배치 처리 간격 (초)
batch_processor_running = False


async def _process_log_batch(service: PipelineService, batch: List[Dict]):
    """
    배치로 로그들을 최적화된 방식으로 처리
    """
    try:
        await service.process_logs_batch(batch)
        logger.info(f"Successfully processed batch of {len(batch)} logs")
    except Exception as e:
        logger.error("Error processing log batch: %s", e)


async def _batch_processor():
    """
    주기적으로 배치를 처리하는 백그라운드 프로세서
    """
    global batch_processor_running
    batch_processor_running = True
    
    while batch_processor_running:
        try:
            await asyncio.sleep(BATCH_TIMEOUT)
            
            if not log_batch_queue:
                continue
                
            # 배치 크기만큼 또는 큐의 모든 항목을 가져옴
            batch = []
            while log_batch_queue and len(batch) < BATCH_SIZE:
                batch.append(log_batch_queue.popleft())
            
            if batch:
                # 배치 처리용 서비스 인스턴스 생성
                from app.infra.database.session import get_db
                db_session = next(get_db())
                try:
                    service = PipelineService(db_session)
                    await _process_log_batch(service, batch)
                finally:
                    db_session.close()
                
        except Exception as e:
            logger.error("Error in batch processor: %s", e)


@router.on_event("startup")
async def startup_event():
    """
    앱 시작 시 배치 프로세서 시작
    """
    asyncio.create_task(_batch_processor())


@router.post("/pipeline")
async def collect_log(
    data: dict,
    api_key: str = Header(..., description="elasticsearch index 연결용 API 키"),
):
    try:
        # 배치 큐에 로그 추가
        log_batch_queue.append({
            "data": data,
            "api_key": api_key,
            "timestamp": datetime.now()
        })
        
        logger.info("Log added to batch queue")
        return {
            "status": "queued",
            "message": "Log queued for batch processing",
            "queue_size": len(log_batch_queue)
        }
    except Exception as e:
        logger.error("Error adding log to batch queue: %s", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")
