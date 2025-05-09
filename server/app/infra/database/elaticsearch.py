from app.core.config.settings import get_settings
from elasticsearch import Elasticsearch
from typing import List, Dict, Any
from app.core.llm.base import LLMFactory
from collections import defaultdict

settings = get_settings()

class ElasticsearchClient:
    """Elasticsearch 클라이언트 클래스"""
    
    def __init__(self):
        self.host = settings.ELASTIC_HOST
        self.username = settings.ELASTIC_USERNAME
        self.password = settings.ELASTIC_PASSWORD
        # Elasticsearch 클라이언트 초기화
        self.es = Elasticsearch(
            settings.ELASTIC_HOST,
            basic_auth=(self.username, self.password),
        )
        self.embedding_model = LLMFactory.create_embedding_model()

    def _generate_embeddings(self, text: str) -> List[float]:
        """ 텍스트를 벡터로 변환 """
        return self.embedding_model.embed_query(text)

    def _execute_search(self, index: str, query: Dict[str, Any], fields: List[str] = None) -> List[Dict[str, Any]]:
        """ Elasticsearch 검색 실행 공통 함수 """
        body = query
        if fields:
            body["fields"] = fields

        result = self.es.search(index=index, body=body)["hits"]["hits"]
        return result

    def search_by_terms(self, index: str, term_field: str, term_values: List[Any]) -> List[Dict[str, Any]]:
        """ terms 기반 검색 공통 함수 """
        query = {"query": {"terms": {term_field: term_values}}}
        return self._execute_search(index, query)   

    def search_by_bm25(self, index: str, query: str, field: str = "name", k: int = 5) -> List[Dict[str, Any]]:
        """ BM25 기반 검색 공통 함수 """
        query_body = {"query": {"match": {field: query}}}
        return self._execute_search(index, query_body)[:k]

    def search_by_vector(self, index: str, query: str, vector_field: str = "embedding", k: int = 5, num_candidates: int = 100) -> List[Dict[str, Any]]:
        """ 벡터 검색 (KNN) """
        query_vector = self._generate_embeddings(query)
        query_body = {
            "knn": {
                "field": vector_field,
                "query_vector": query_vector,
                "k": k,
                "num_candidates": num_candidates,
            }
        }
        return self._execute_search(index, query_body)
    
    def search_by_hybrid(self, index: str, query: str, k: int = 5) -> List[Dict[str, Any]]:
        """ 하이브리드 검색 """
        bm25_results = self.search_by_bm25(index, query, field="notice_content", k=k)
        vector_results = self.search_by_vector(index, query, k=k)
        return self.reciprocal_rank_fusion([bm25_results, vector_results], k)

    def reciprocal_rank_fusion(self, rankings: List[List[str]], k: int = 5) -> List[Dict[str, Any]]:
        """ RRF (Reciprocal Rank Fusion) 알고리즘 """
        rrf = defaultdict(float)
        for ranking in rankings:
            for i, r in enumerate(ranking):
                rrf[r["_id"]] += 1.0 / (k + i)

        return [{"id": doc_id, "score": score} for doc_id, score in sorted(rrf.items(), key=lambda x: x[1], reverse=True)]