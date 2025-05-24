from fastapi import HTTPException
from app.infra.database.elaticsearch import ElasticsearchClient
from app.core.config.elastic_config import ELASTIC_MAPPINGS


es = ElasticsearchClient()

def save_log(index_name: str, log_data: dict):
    """로그를 저장하는 함수"""
    es.save_document(
        index=index_name,
        document=log_data
    )

def retrieve_log(index_name: str, query: str, category: str = None, start_time: str = None, end_time: str = None):
    """로그를 검색하는 함수"""
    if category:
        category_filter = {
            "category": category
        }
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
        filter=es.generate_filter(category_filter, time_filter)
    )
    if not search_by_hybrid:
        raise HTTPException(
            status_code=404,
            detail="No logs found."
        )
    return search_by_hybrid