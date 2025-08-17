import pytest
from unittest.mock import Mock, patch
from app.core.config.elastic_config import get_elastic_mappings
from app.core.config.settings import Settings


class TestElasticConfig:
    """Elasticsearch 설정 테스트"""
    
    def setup_method(self):
        self.mock_settings = Mock(spec=Settings)
    
    @patch('app.core.config.elastic_config.get_settings')
    def test_get_elastic_mappings_openai_dims(self, mock_get_settings):
        """OpenAI 임베딩 차원수로 매핑 생성 테스트"""
        self.mock_settings.EMBEDDING_VECTOR_DIMS = 1536
        mock_get_settings.return_value = self.mock_settings
        
        mappings = get_elastic_mappings()
        
        # 벡터 필드 차원수 확인
        vector_field = mappings["properties"]["vector"]
        assert vector_field["type"] == "dense_vector"
        assert vector_field["dims"] == 1536
        assert vector_field["index"] is True
        assert vector_field["similarity"] == "cosine"
    
    @patch('app.core.config.elastic_config.get_settings')
    def test_get_elastic_mappings_huggingface_dims(self, mock_get_settings):
        """HuggingFace 임베딩 차원수로 매핑 생성 테스트"""
        self.mock_settings.EMBEDDING_VECTOR_DIMS = 384  # all-MiniLM-L6-v2
        mock_get_settings.return_value = self.mock_settings
        
        mappings = get_elastic_mappings()
        
        # 벡터 필드 차원수 확인
        vector_field = mappings["properties"]["vector"]
        assert vector_field["dims"] == 384
    
    @patch('app.core.config.elastic_config.get_settings')
    def test_get_elastic_mappings_custom_dims(self, mock_get_settings):
        """커스텀 임베딩 차원수로 매핑 생성 테스트"""
        self.mock_settings.EMBEDDING_VECTOR_DIMS = 768  # all-mpnet-base-v2
        mock_get_settings.return_value = self.mock_settings
        
        mappings = get_elastic_mappings()
        
        # 벡터 필드 차원수 확인
        vector_field = mappings["properties"]["vector"]
        assert vector_field["dims"] == 768
    
    @patch('app.core.config.elastic_config.get_settings')
    def test_get_elastic_mappings_structure(self, mock_get_settings):
        """전체 매핑 구조 확인 테스트"""
        self.mock_settings.EMBEDDING_VECTOR_DIMS = 1536
        mock_get_settings.return_value = self.mock_settings
        
        mappings = get_elastic_mappings()
        
        # 기본 구조 확인
        assert "properties" in mappings
        properties = mappings["properties"]
        
        # 필수 필드들 존재 확인
        required_fields = [
            "@timestamp", "message", "comment", "keyword", 
            "vector", "message_timestamp", "log_level"
        ]
        for field in required_fields:
            assert field in properties
        
        # 타임스탬프 필드 타입 확인
        assert properties["@timestamp"]["type"] == "date"
        assert properties["message_timestamp"]["type"] == "date"
        
        # 텍스트 필드 타입 확인
        assert properties["message"]["type"] == "text"
        assert properties["comment"]["type"] == "text"
        assert properties["keyword"]["type"] == "text"
        
        # 벡터 필드 구조 상세 확인
        vector_field = properties["vector"]
        assert vector_field["type"] == "dense_vector"
        assert vector_field["index"] is True
        assert vector_field["similarity"] == "cosine"
    
    @patch('app.core.config.elastic_config.get_settings')
    def test_get_elastic_mappings_returns_dict(self, mock_get_settings):
        """매핑 함수가 딕셔너리를 반환하는지 테스트"""
        self.mock_settings.EMBEDDING_VECTOR_DIMS = 1536
        mock_get_settings.return_value = self.mock_settings
        
        mappings = get_elastic_mappings()
        
        assert isinstance(mappings, dict)
        assert len(mappings) > 0
    
    @patch('app.core.config.elastic_config.get_settings')
    def test_multiple_calls_return_same_structure(self, mock_get_settings):
        """여러 번 호출해도 동일한 구조 반환 테스트"""
        self.mock_settings.EMBEDDING_VECTOR_DIMS = 1536
        mock_get_settings.return_value = self.mock_settings
        
        mappings1 = get_elastic_mappings()
        mappings2 = get_elastic_mappings()
        
        # 구조가 동일한지 확인 (내용은 같지만 다른 객체)
        assert mappings1.keys() == mappings2.keys()
        assert mappings1["properties"].keys() == mappings2["properties"].keys()
        assert mappings1["properties"]["vector"]["dims"] == mappings2["properties"]["vector"]["dims"]
    
    @patch('app.core.config.elastic_config.get_settings')
    def test_different_dims_produce_different_mappings(self, mock_get_settings):
        """다른 차원수 설정 시 다른 매핑 생성 테스트"""
        # 첫 번째 호출: 1536 차원
        self.mock_settings.EMBEDDING_VECTOR_DIMS = 1536
        mock_get_settings.return_value = self.mock_settings
        mappings_1536 = get_elastic_mappings()
        
        # 두 번째 호출: 384 차원
        self.mock_settings.EMBEDDING_VECTOR_DIMS = 384
        mappings_384 = get_elastic_mappings()
        
        # 벡터 차원수가 다른지 확인
        assert mappings_1536["properties"]["vector"]["dims"] == 1536
        assert mappings_384["properties"]["vector"]["dims"] == 384
        assert mappings_1536["properties"]["vector"]["dims"] != mappings_384["properties"]["vector"]["dims"]
        
        # 다른 필드들은 동일한지 확인
        assert mappings_1536["properties"]["vector"]["type"] == mappings_384["properties"]["vector"]["type"]
        assert mappings_1536["properties"]["vector"]["similarity"] == mappings_384["properties"]["vector"]["similarity"]