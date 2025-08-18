"""
기본 기능 통합 테스트
실제 환경에서 LLM Factory와 설정이 올바르게 동작하는지 테스트
"""
import pytest
from unittest.mock import patch, Mock
from app.core.llm.base import LLMFactory
from app.core.config.elastic_config import get_elastic_mappings
from app.core.config.settings import get_settings
from app.core.enums.LLMProvider import LLMProvider


class TestBasicFunctionality:
    """기본 기능 통합 테스트"""
    
    def test_supported_providers_available(self):
        """지원되는 제공업체 목록 확인"""
        providers = LLMFactory.get_supported_providers()
        
        expected_providers = ["openai", "anthropic", "ollama", "huggingface"]
        assert set(providers) == set(expected_providers)
        assert len(providers) == 4
    
    def test_settings_loading(self):
        """설정 로딩 테스트"""
        settings = get_settings()
        
        # 기본 설정값 확인
        assert hasattr(settings, 'LLM_PROVIDER')
        assert hasattr(settings, 'PIPELINE_MODEL_NAME')
        assert hasattr(settings, 'TROUBLESHOOTING_MODEL_NAME')
        assert hasattr(settings, 'EMBEDDING_VECTOR_DIMS')
        
        # 기본값 확인
        assert settings.LLM_PROVIDER == LLMProvider.OPENAI
        assert settings.PIPELINE_MODEL_NAME == "gpt-4o-mini"
        assert settings.TROUBLESHOOTING_MODEL_NAME == "gpt-4o"
        assert settings.EMBEDDING_VECTOR_DIMS == 1536
    
    def test_elastic_mappings_generation(self):
        """Elasticsearch 매핑 생성 테스트"""
        mappings = get_elastic_mappings()
        
        # 기본 구조 확인
        assert isinstance(mappings, dict)
        assert "properties" in mappings
        
        # 벡터 필드 확인
        vector_field = mappings["properties"]["vector"]
        assert vector_field["type"] == "dense_vector"
        assert vector_field["dims"] == 1536  # 기본값
        assert vector_field["index"] is True
        assert vector_field["similarity"] == "cosine"
    
    @patch.dict('os.environ', {
        'LLM_PROVIDER': 'openai',
        'OPENAI_API_KEY': 'test-key',
        'PIPELINE_MODEL_NAME': 'gpt-4o-mini',
        'TROUBLESHOOTING_MODEL_NAME': 'gpt-4o'
    })
    def test_environment_variable_override(self):
        """환경변수 오버라이드 테스트"""
        # 새로운 설정 인스턴스 생성 (캐시 우회)
        from app.core.config.settings import Settings
        settings = Settings()
        
        assert settings.LLM_PROVIDER == LLMProvider.OPENAI
        assert settings.PIPELINE_MODEL_NAME == "gpt-4o-mini"
        assert settings.TROUBLESHOOTING_MODEL_NAME == "gpt-4o"
    
    @patch('app.core.llm.base.get_settings')
    @patch('app.core.llm.base.OpenAIProvider')
    def test_factory_method_differences(self, mock_provider_class, mock_get_settings):
        """팩토리 메서드별 차이점 테스트"""
        # Mock 설정
        mock_settings = Mock()
        mock_settings.LLM_PROVIDER = LLMProvider.OPENAI
        mock_settings.PIPELINE_MODEL_NAME = "gpt-4o-mini"
        mock_settings.TROUBLESHOOTING_MODEL_NAME = "gpt-4o"
        mock_get_settings.return_value = mock_settings
        
        mock_provider = Mock()
        mock_provider_class.return_value = mock_provider
        mock_provider.validate_config.return_value = True
        mock_provider.create_chat_model.return_value = Mock()
        
        # 파이프라인 모델 생성
        LLMFactory.create_pipeline_model()
        
        # 파이프라인 모델 호출 확인
        pipeline_call = mock_provider.create_chat_model.call_args
        assert pipeline_call.kwargs['model_name'] == "gpt-4o-mini"
        assert pipeline_call.kwargs['temperature'] == 0.3
        
        # Mock 초기화
        mock_provider.reset_mock()
        
        # 트러블슈팅 모델 생성  
        LLMFactory.create_troubleshooting_model()
        
        # 트러블슈팅 모델 호출 확인
        troubleshooting_call = mock_provider.create_chat_model.call_args
        assert troubleshooting_call.kwargs['model_name'] == "gpt-4o"
        assert troubleshooting_call.kwargs['temperature'] == 0.5
    
    def test_validate_llm_config_method(self):
        """LLM 설정 검증 메서드 테스트"""
        settings = get_settings()
        
        # validate_llm_config 메서드 존재 확인
        assert hasattr(settings, 'validate_llm_config')
        assert callable(settings.validate_llm_config)
    
    @patch.dict('os.environ', {
        'EMBEDDING_VECTOR_DIMS': '384'
    })
    def test_dynamic_embedding_dims(self):
        """동적 임베딩 차원수 테스트"""
        from app.core.config.settings import Settings
        settings = Settings()
        
        # 환경변수로 설정된 차원수 확인
        assert settings.EMBEDDING_VECTOR_DIMS == 384
        
        # 매핑에 반영되는지 확인
        with patch('app.core.config.elastic_config.get_settings', return_value=settings):
            mappings = get_elastic_mappings()
            assert mappings["properties"]["vector"]["dims"] == 384


class TestErrorHandling:
    """오류 처리 테스트"""
    
    @patch('app.core.llm.base.get_settings')
    def test_unsupported_provider_error(self, mock_get_settings):
        """지원하지 않는 제공업체 오류 테스트"""
        mock_settings = Mock()
        mock_settings.LLM_PROVIDER = "unsupported_provider"  # 문자열 그대로 (에러 테스트용)
        mock_get_settings.return_value = mock_settings
        
        with pytest.raises(ValueError, match="Unsupported LLM provider: unsupported_provider"):
            LLMFactory.create_pipeline_model()
    
    def test_missing_base_provider_methods(self):
        """BaseLLMProvider 추상 메서드 확인"""
        from app.core.llm.providers.base_provider import BaseLLMProvider
        
        # 추상 클래스 직접 인스턴스화 시도 시 오류 발생 확인
        with pytest.raises(TypeError):
            BaseLLMProvider()


class TestProviderMapping:
    """제공업체 매핑 테스트"""
    
    def test_provider_mapping_complete(self):
        """제공업체 매핑이 완전한지 테스트"""
        from app.core.llm.base import LLMFactory
        
        # 매핑된 제공업체들 확인
        providers = LLMFactory._providers
        
        assert "openai" in providers
        assert "anthropic" in providers
        assert "ollama" in providers
        assert "huggingface" in providers
        
        # 각 제공업체가 실제 클래스인지 확인
        for provider_name, provider_class in providers.items():
            assert hasattr(provider_class, 'create_chat_model')
            assert hasattr(provider_class, 'create_embedding_model')
            assert hasattr(provider_class, 'validate_config')
    
    def test_provider_class_imports(self):
        """제공업체 클래스 임포트 테스트"""
        from app.core.llm.providers.openai_provider import OpenAIProvider
        from app.core.llm.providers.anthropic_provider import AnthropicProvider
        from app.core.llm.providers.ollama_provider import OllamaProvider
        from app.core.llm.providers.huggingface_provider import HuggingFaceProvider
        from app.core.llm.providers.base_provider import BaseLLMProvider
        
        # 모든 제공업체가 기본 클래스를 상속받는지 확인
        assert issubclass(OpenAIProvider, BaseLLMProvider)
        assert issubclass(AnthropicProvider, BaseLLMProvider)
        assert issubclass(OllamaProvider, BaseLLMProvider)
        assert issubclass(HuggingFaceProvider, BaseLLMProvider)