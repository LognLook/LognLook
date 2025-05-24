from fastapi import HTTPException
from app.infra.database.elaticsearch import ElasticsearchClient
from app.core.config.elastic_config import ELASTIC_MAPPINGS

def save_log():
    pass

def retrieve_log(index_name: str, query: str, category: str = None, start_time: str = None, end_time: str = None):
    """로그를 검색하는 함수"""
    es = ElasticsearchClient()
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

def create_index(index_name: str):
    es = ElasticsearchClient()
    if es.indices.exists(index=index_name):
        raise HTTPException(
            status_code=500,
            detail=f"Index {index_name} already exists."
        )
    es.indices.create(index=index_name, mappings=ELASTIC_MAPPINGS)
