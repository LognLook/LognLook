from fastapi import HTTPException
from app.infra.database.elaticsearch import ElasticsearchClient
from app.core.config.elastic_config import get_elastic_mappings
from typing import List, Dict, Any
from app.core.enums.log_filter import LogLevelFilter

es = ElasticsearchClient()


def create_project_index(index_name: str, mappings: dict = None) -> None:
    """인덱스를 생성하는 함수"""
    if mappings is None:
        mappings = get_elastic_mappings()
    
    try:
        es.create_index(index_name, mappings)
    except ValueError as e:
        # 인덱스가 이미 존재하는 경우
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        # 기타 Elasticsearch 관련 에러
        raise HTTPException(
            status_code=500, detail=f"Failed to create index {index_name}: {str(e)}"
        )


def delete_project_index(index_name: str) -> None:
    """인덱스를 삭제하는 함수"""
    try:
        es.delete_index(index_name)
    except Exception as e:
        # Elasticsearch 관련 에러
        raise HTTPException(
            status_code=500, detail=f"Failed to delete index {index_name}: {str(e)}"
        )


def save_log(index_name: str, log_data: dict):
    """로그를 저장하는 함수"""
    es.save_document(index=index_name, document=log_data)

def retrieve_logs(
    index_name: str,
    query: str,
    keyword: str = None,
    log_level: LogLevelFilter = None,
    start_time: str = None,
    end_time: str = None,
    k: int = 50,
):
    """로그를 검색하는 함수"""
    keyword_filter = None
    if keyword:
        keyword_filter = {"keyword": keyword}
    log_level_filter = None
    if log_level:
        log_level_filter = {"log_level": log_level.value}
    term_filter = [keyword_filter, log_level_filter]
    
    time_filter = None
    if start_time and end_time:
        time_filter = {"message_timestamp": {"gte": start_time, "lte": end_time}}
        
    search_by_hybrid = es.search_by_vector(
        index=index_name,
        query=query,
        filters=es.generate_filter(
            term_filter=term_filter, range_filter=time_filter
        ),
        k=k,
    )
    return search_by_hybrid

def get_logs_by_ids(index_name: str, ids: List[str]) -> List[Dict[str, Any]]:
    """id로 로그를 검색하는 함수"""
    try:
        results = es.search_by_id(index=index_name, ids=ids)
        return results
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Failed to retrieve logs by ID: {str(e)}"
        )

def get_logs_by_datetime(index_name: str, start_time: str, end_time: str, size: int = 100):
    """시간 범위로 로그를 검색하는 함수"""
    try:
        time_filter = {"message_timestamp": {"gte": start_time, "lte": end_time}}
        results = es.search_by_datetime(index=index_name, time_filter=time_filter, size=size)
        return results
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve logs by datetime: {str(e)}")