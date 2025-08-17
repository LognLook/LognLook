import pytest
from unittest.mock import Mock, patch
from app.core.llm.base import LLMFactory
from app.core.config.settings import Settings


class TestLLMFactory:
    """LLM Factory 테스트"""
    
    def setup_method(self):
        """각 테스트 메서드 실행 전 호출"""
        self.mock_settings = Mock(spec=Settings)
        self.mock_settings.LLM_PROVIDER = "openai"
        self.mock_settings.OPENAI_API_KEY = "test-key"
        self.mock_settings.CHAT_MODEL_TEMPERATURE = 0.5
        self.mock_settings.PIPELINE_MODEL_NAME = "gpt-4o-mini"
        self.mock_settings.TROUBLESHOOTING_MODEL_NAME = "gpt-4o"
    
    @patch('app.core.llm.base.get_settings')
    @patch('app.core.llm.base.OpenAIProvider')
    def test_create_pipeline_model_openai(self, mock_provider_class, mock_get_settings):
        """OpenAI 파이프라인 모델 생성 테스트"""
        mock_get_settings.return_value = self.mock_settings
        
        mock_provider = Mock()
        mock_provider_class.return_value = mock_provider
        mock_provider.validate_config.return_value = True
        mock_model = Mock()
        mock_provider.create_chat_model.return_value = mock_model
        
        # 파이프라인 모델 생성
        result = LLMFactory.create_pipeline_model()
        
        # 검증
        mock_provider_class.assert_called_once()
        mock_provider.validate_config.assert_called_once()
        mock_provider.create_chat_model.assert_called_once_with(
            model_name="gpt-4o-mini",
            temperature=0.3
        )
        assert result == mock_model
    
    @patch('app.core.llm.base.get_settings')
    def test_create_troubleshooting_model_openai(self, mock_get_settings):
        """OpenAI 트러블슈팅 모델 생성 테스트"""
        mock_get_settings.return_value = self.mock_settings
        
        with patch('app.core.llm.providers.openai_provider.OpenAIProvider') as mock_provider_class:
            mock_provider = Mock()
            mock_provider_class.return_value = mock_provider
            mock_provider.validate_config.return_value = True
            mock_model = Mock()
            mock_provider.create_chat_model.return_value = mock_model
            
            # 트러블슈팅 모델 생성
            result = LLMFactory.create_troubleshooting_model()
            
            # 검증
            mock_provider.validate_config.assert_called_once()
            mock_provider.create_chat_model.assert_called_once_with(
                model_name="gpt-4o",
                temperature=0.5
            )
            assert result == mock_model
    
    @patch('app.core.llm.base.get_settings')
    def test_create_embedding_model_openai(self, mock_get_settings):
        """OpenAI 임베딩 모델 생성 테스트"""
        mock_get_settings.return_value = self.mock_settings
        
        with patch('app.core.llm.providers.openai_provider.OpenAIProvider') as mock_provider_class:
            mock_provider = Mock()
            mock_provider_class.return_value = mock_provider
            mock_provider.validate_config.return_value = True
            mock_embedding_model = Mock()
            mock_provider.create_embedding_model.return_value = mock_embedding_model
            
            # 임베딩 모델 생성
            result = LLMFactory.create_embedding_model()
            
            # 검증
            mock_provider.validate_config.assert_called_once()
            mock_provider.create_embedding_model.assert_called_once()
            assert result == mock_embedding_model
    
    @patch('app.core.llm.base.get_settings')
    def test_unsupported_provider_raises_error(self, mock_get_settings):
        """지원하지 않는 제공업체 설정 시 오류 발생 테스트"""
        self.mock_settings.LLM_PROVIDER = "unsupported_provider"
        mock_get_settings.return_value = self.mock_settings
        
        with pytest.raises(ValueError, match="Unsupported LLM provider: unsupported_provider"):
            LLMFactory.create_pipeline_model()
    
    @patch('app.core.llm.base.get_settings')
    def test_anthropic_provider_selection(self, mock_get_settings):
        """Anthropic 제공업체 선택 테스트"""
        self.mock_settings.LLM_PROVIDER = "anthropic"
        self.mock_settings.ANTHROPIC_API_KEY = "test-anthropic-key"
        mock_get_settings.return_value = self.mock_settings
        
        with patch('app.core.llm.providers.anthropic_provider.AnthropicProvider') as mock_provider_class:
            mock_provider = Mock()
            mock_provider_class.return_value = mock_provider
            mock_provider.validate_config.return_value = True
            mock_model = Mock()
            mock_provider.create_chat_model.return_value = mock_model
            
            # Anthropic 모델 생성
            result = LLMFactory.create_pipeline_model()
            
            # Anthropic 제공업체가 선택되었는지 확인
            mock_provider_class.assert_called_once()
            mock_provider.validate_config.assert_called_once()
            assert result == mock_model
    
    @patch('app.core.llm.base.get_settings')
    def test_ollama_provider_selection(self, mock_get_settings):
        """Ollama 제공업체 선택 테스트"""
        self.mock_settings.LLM_PROVIDER = "ollama"
        self.mock_settings.OLLAMA_BASE_URL = "http://localhost:11434"
        mock_get_settings.return_value = self.mock_settings
        
        with patch('app.core.llm.providers.ollama_provider.OllamaProvider') as mock_provider_class:
            mock_provider = Mock()
            mock_provider_class.return_value = mock_provider
            mock_provider.validate_config.return_value = True
            mock_model = Mock()
            mock_provider.create_chat_model.return_value = mock_model
            
            # Ollama 모델 생성
            result = LLMFactory.create_troubleshooting_model()
            
            # Ollama 제공업체가 선택되었는지 확인
            mock_provider_class.assert_called_once()
            mock_provider.validate_config.assert_called_once()
            assert result == mock_model
    
    def test_get_supported_providers(self):
        """지원되는 제공업체 목록 반환 테스트"""
        providers = LLMFactory.get_supported_providers()
        expected_providers = ["openai", "anthropic", "ollama", "huggingface"]
        
        assert set(providers) == set(expected_providers)
        assert len(providers) == 4
    
    @patch('app.core.llm.base.get_settings')
    def test_custom_kwargs_passed_to_provider(self, mock_get_settings):
        """커스텀 kwargs가 제공업체에 전달되는지 테스트"""
        mock_get_settings.return_value = self.mock_settings
        
        with patch('app.core.llm.providers.openai_provider.OpenAIProvider') as mock_provider_class:
            mock_provider = Mock()
            mock_provider_class.return_value = mock_provider
            mock_provider.validate_config.return_value = True
            mock_model = Mock()
            mock_provider.create_chat_model.return_value = mock_model
            
            # 커스텀 kwargs와 함께 모델 생성
            custom_kwargs = {"max_tokens": 1000, "custom_param": "test"}
            result = LLMFactory.create_pipeline_model(**custom_kwargs)
            
            # 커스텀 kwargs가 전달되었는지 확인
            expected_kwargs = {
                "model_name": "gpt-4o-mini",
                "temperature": 0.3,
                "max_tokens": 1000,
                "custom_param": "test"
            }
            mock_provider.create_chat_model.assert_called_once_with(**expected_kwargs)
            assert result == mock_model