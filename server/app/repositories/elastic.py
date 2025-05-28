from fastapi import HTTPException
from app.infra.database.elaticsearch import ElasticsearchClient
from app.core.config.elastic_config import ELASTIC_MAPPINGS
from typing import List, Dict, Any


es = ElasticsearchClient()

def create_project_index(index_name: str, mappings: dict = ELASTIC_MAPPINGS) -> None:
    """인덱스를 생성하는 함수"""
    try:
        es.create_index(index_name, mappings)
    except ValueError as e:
        # 인덱스가 이미 존재하는 경우
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )
    except Exception as e:
        # 기타 Elasticsearch 관련 에러
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create index {index_name}: {str(e)}"
        )

def save_log(index_name: str, log_data: dict):
    """로그를 저장하는 함수"""
    es.save_document(
        index=index_name,
        document=log_data
    )

def retrieve_log(index_name: str, query: str, category: str = None, start_time: str = None, end_time: str = None, k: int = 10):
    """로그를 검색하는 함수"""
    category_filter = None
    if category:
        category_filter = {
            "category": category
        }
    time_filter = None
    if start_time and end_time:
        time_filter = {
            "@timestamp": {
                "gte": start_time,
                "lte": end_time
            }
        }   
    search_by_hybrid = es.search_by_vector(
        index=index_name,
        query=query,
        filters=es.generate_filter(term_filter=category_filter, range_filter=time_filter),
        k=k
    )
    if not search_by_hybrid:
        raise HTTPException(
            status_code=404,
            detail="No logs found."
        )
    return search_by_hybrid

def get_logs_by_id(index_name: str, ids: List[str]) -> List[Dict[str, Any]]:
    """id로 로그를 검색하는 함수"""
    try:
        results = es.search_by_id(
            index=index_name,
            ids=ids
        )
        if not results:
            raise HTTPException(
                status_code=404,
                detail="No logs found with the provided IDs."
            )
        return results
    except HTTPException:
        raise  
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve logs by ID: {str(e)}"
        )
