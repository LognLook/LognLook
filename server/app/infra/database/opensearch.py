from opensearchpy import OpenSearch

from typing import List, Dict, Any
from collections import defaultdict

from app.core.config.settings import get_settings
from app.core.llm.base import LLMFactory


settings = get_settings()

class OpenSearchClient:
    """OpenSearch 클라이언트 클래스"""
    
    def __init__(self):
        self.host = settings.OPENSEARCH_HOST
        self.username = settings.OPENSEARCH_USERNAME
        self.password = settings.OPENSEARCH_PASSWORD
        # OpenSearch 클라이언트 초기화
        self.client = OpenSearch(
            hosts=[settings.OPENSEARCH_HOST],
            # http_auth=(self.username, self.password),
            use_ssl=False,
        )
        self.embedding_model = LLMFactory.create_embedding_model()
        
    def _generate_embeddings(self, text: str) -> List[float]:
        """ 텍스트를 벡터로 변환 """
        return self.embedding_model.embed_query(text)
    
    def _execute_search(self, index: str, body: Dict[str, Any], size: int = 100) -> List[Dict[str, Any]]:
        """ Elasticsearch 검색 실행 공통 함수 """
        if "size" not in body:
            body["size"] = size
        return self.client.search(index=index, body=body)["hits"]["hits"]
    
    def save_document(self, index: str, document: Dict[str, Any]) -> None:
        """ 문서를 OpenSearch에 저장 """
        if not self.client.indices.exists(index=index):
            self.client.indices.create(index=index)
        self.client.index(index=index, body=document)

    def generate_filter(self, term_filter: List[Dict] = None, range_filter: Dict[str, Any] = None) -> dict:
        """필터 조건을 생성하는 함수"""
        filter_conditions = {
            "bool": {
                "must": []
            }
        }
        
        for term in term_filter:
            if term is not None:
                term_condition = {
                    "term": term
                }
                filter_conditions["bool"]["must"].append(term_condition)
            
        if range_filter is not None:
            range_condition = {
                "range": range_filter
            }
            filter_conditions["bool"]["must"].append(range_condition)
            
        return filter_conditions
    
    def create_index(self, index: str, mappings: Dict[str, Any]) -> None:
        """ 인덱스를 생성하는 함수 """
        if not self.client.indices.exists(index=index):
            self.client.indices.create(index=index, body={"mappings": mappings})
        else:
            raise ValueError(f"Index {index} already exists")

    def delete_index(self, index: str) -> None:
        """ 인덱스를 삭제하는 함수 """
        if self.client.indices.exists(index=index):
            self.client.indices.delete(index=index)
        else:
            raise ValueError(f"Index {index} does not exist")

    def search_by_id(self, index: str, ids: List[str]) -> List[Any]:
        """ id로 검색하는 함수 """
        query = {"query": {"ids": {"values": ids}}}
        return self._execute_search(index, query)
    
    def search_by_datetime(self, index: str, time_filter: Dict[str, Any], size: int = 100) -> List[Any]:
        """ 시간 범위로 검색하는 함수 """
        query = {"query": {"range": time_filter}, "size": size}
        return self._execute_search(index, query, size=size)

    def search_by_terms(self, index: str, term_field: str, term_values: List[Any]) -> List[Dict[str, Any]]:
        """ terms 기반 검색 공통 함수 """
        query = {"query": {"terms": {term_field: term_values}}}
        return self._execute_search(index, query)   

    def search_by_bm25(self, index: str, query: str, field: str = "name", k: int = 5) -> List[Dict[str, Any]]:
        """ BM25 기반 검색 공통 함수 """
        query_body = {"query": {"match": {field: query}}}
        return self._execute_search(index, query_body)[:k]

    def search_by_vector(self, index: str, query: str, vector_field: str = "vector", filters: Dict[str, Any] = None, k: int = 50, num_candidates: int = 200) -> List[Dict[str, Any]]:
        """ 벡터 검색 (OpenSearch kNN) """
        query_vector = self._generate_embeddings(query)
        query_body = {
            "knn": {
                "field": vector_field,
                "query_vector": query_vector,
                "k": k,
                "num_candidates": num_candidates,
            },
        }
        if filters:
            query_body["knn"]["filter"] = filters
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