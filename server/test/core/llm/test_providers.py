import pytest
from unittest.mock import Mock, patch
from app.core.llm.providers.openai_provider import OpenAIProvider
from app.core.llm.providers.anthropic_provider import AnthropicProvider
from app.core.llm.providers.ollama_provider import OllamaProvider
from app.core.llm.providers.huggingface_provider import HuggingFaceProvider
from app.core.config.settings import Settings


class TestOpenAIProvider:
    """OpenAI 제공업체 테스트"""
    
    def setup_method(self):
        self.mock_settings = Mock(spec=Settings)
        self.mock_settings.OPENAI_API_KEY = "test-openai-key"
        self.mock_settings.CHAT_MODEL_NAME = "gpt-4o"
        self.mock_settings.CHAT_MODEL_MAX_TOKENS = 2000
        self.mock_settings.EMBEDDING_MODEL_NAME = "text-embedding-3-small"
    
    @patch('app.core.llm.providers.openai_provider.get_settings')
    @patch('app.core.llm.providers.openai_provider.ChatOpenAI')
    def test_create_chat_model(self, mock_chat_openai, mock_get_settings):
        """OpenAI Chat 모델 생성 테스트"""
        mock_get_settings.return_value = self.mock_settings
        mock_model = Mock()
        mock_chat_openai.return_value = mock_model
        
        provider = OpenAIProvider()
        result = provider.create_chat_model(temperature=0.7)
        
        mock_chat_openai.assert_called_once_with(
            model="gpt-4o",
            temperature=0.7,
            max_tokens=2000,
            api_key="test-openai-key"
        )
        assert result == mock_model
    
    @patch('app.core.llm.providers.openai_provider.get_settings')
    @patch('app.core.llm.providers.openai_provider.OpenAIEmbeddings')
    def test_create_embedding_model(self, mock_openai_embeddings, mock_get_settings):
        """OpenAI 임베딩 모델 생성 테스트"""
        mock_get_settings.return_value = self.mock_settings
        mock_embedding_model = Mock()
        mock_openai_embeddings.return_value = mock_embedding_model
        
        provider = OpenAIProvider()
        result = provider.create_embedding_model()
        
        mock_openai_embeddings.assert_called_once_with(
            model="text-embedding-3-small",
            openai_api_key="test-openai-key"
        )
        assert result == mock_embedding_model
    
    @patch('app.core.llm.providers.openai_provider.get_settings')
    def test_validate_config_success(self, mock_get_settings):
        """OpenAI 설정 검증 성공 테스트"""
        mock_get_settings.return_value = self.mock_settings
        
        provider = OpenAIProvider()
        result = provider.validate_config()
        
        assert result is True
    
    @patch('app.core.llm.providers.openai_provider.get_settings')
    def test_validate_config_missing_api_key(self, mock_get_settings):
        """OpenAI API 키 누락 시 검증 실패 테스트"""
        self.mock_settings.OPENAI_API_KEY = ""
        mock_get_settings.return_value = self.mock_settings
        
        provider = OpenAIProvider()
        
        with pytest.raises(ValueError, match="OPENAI_API_KEY is required for OpenAI provider"):
            provider.validate_config()


class TestAnthropicProvider:
    """Anthropic 제공업체 테스트"""
    
    def setup_method(self):
        self.mock_settings = Mock(spec=Settings)
        self.mock_settings.ANTHROPIC_API_KEY = "test-anthropic-key"
        self.mock_settings.CHAT_MODEL_NAME = "claude-3-5-sonnet-20241022"
        self.mock_settings.CHAT_MODEL_MAX_TOKENS = 2000
    
    @patch('app.core.llm.providers.anthropic_provider.get_settings')
    @patch('app.core.llm.providers.anthropic_provider.ChatAnthropic')
    def test_create_chat_model(self, mock_chat_anthropic, mock_get_settings):
        """Anthropic Chat 모델 생성 테스트"""
        mock_get_settings.return_value = self.mock_settings
        mock_model = Mock()
        mock_chat_anthropic.return_value = mock_model
        
        provider = AnthropicProvider()
        result = provider.create_chat_model(temperature=0.8)
        
        mock_chat_anthropic.assert_called_once_with(
            model="claude-3-5-sonnet-20241022",
            temperature=0.8,
            max_tokens=2000,
            api_key="test-anthropic-key"
        )
        assert result == mock_model
    
    @patch('app.core.llm.providers.anthropic_provider.get_settings')
    def test_validate_config_success(self, mock_get_settings):
        """Anthropic 설정 검증 성공 테스트"""
        mock_get_settings.return_value = self.mock_settings
        
        provider = AnthropicProvider()
        result = provider.validate_config()
        
        assert result is True
    
    @patch('app.core.llm.providers.anthropic_provider.get_settings')
    def test_validate_config_missing_api_key(self, mock_get_settings):
        """Anthropic API 키 누락 시 검증 실패 테스트"""
        self.mock_settings.ANTHROPIC_API_KEY = ""
        mock_get_settings.return_value = self.mock_settings
        
        provider = AnthropicProvider()
        
        with pytest.raises(ValueError, match="ANTHROPIC_API_KEY is required for Anthropic provider"):
            provider.validate_config()


class TestOllamaProvider:
    """Ollama 제공업체 테스트"""
    
    def setup_method(self):
        self.mock_settings = Mock(spec=Settings)
        self.mock_settings.OLLAMA_BASE_URL = "http://localhost:11434"
        self.mock_settings.CHAT_MODEL_NAME = "llama3.2"
    
    @patch('app.core.llm.providers.ollama_provider.get_settings')
    @patch('app.core.llm.providers.ollama_provider.ChatOllama')
    def test_create_chat_model(self, mock_chat_ollama, mock_get_settings):
        """Ollama Chat 모델 생성 테스트"""
        mock_get_settings.return_value = self.mock_settings
        mock_model = Mock()
        mock_chat_ollama.return_value = mock_model
        
        provider = OllamaProvider()
        result = provider.create_chat_model(temperature=0.6)
        
        mock_chat_ollama.assert_called_once_with(
            model="llama3.2",
            base_url="http://localhost:11434",
            temperature=0.6
        )
        assert result == mock_model
    
    @patch('app.core.llm.providers.ollama_provider.get_settings')
    @patch('app.core.llm.providers.ollama_provider.HuggingFaceEmbeddings')
    def test_create_embedding_model(self, mock_hf_embeddings, mock_get_settings):
        """Ollama 임베딩 모델 생성 테스트"""
        mock_get_settings.return_value = self.mock_settings
        mock_embedding_model = Mock()
        mock_hf_embeddings.return_value = mock_embedding_model
        
        provider = OllamaProvider()
        result = provider.create_embedding_model()
        
        mock_hf_embeddings.assert_called_once_with(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )
        assert result == mock_embedding_model
    
    @patch('app.core.llm.providers.ollama_provider.get_settings')
    def test_validate_config_success(self, mock_get_settings):
        """Ollama 설정 검증 성공 테스트 (API 키 불필요)"""
        mock_get_settings.return_value = self.mock_settings
        
        provider = OllamaProvider()
        result = provider.validate_config()
        
        assert result is True


class TestHuggingFaceProvider:
    """HuggingFace 제공업체 테스트"""
    
    def setup_method(self):
        self.mock_settings = Mock(spec=Settings)
        self.mock_settings.CHAT_MODEL_NAME = "microsoft/DialoGPT-medium"
        self.mock_settings.CHAT_MODEL_MAX_TOKENS = 2000
        self.mock_settings.EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
    
    @patch('app.core.llm.providers.huggingface_provider.get_settings')
    @patch('app.core.llm.providers.huggingface_provider.HuggingFacePipeline')
    def test_create_chat_model(self, mock_hf_pipeline, mock_get_settings):
        """HuggingFace Chat 모델 생성 테스트"""
        mock_get_settings.return_value = self.mock_settings
        mock_model = Mock()
        mock_hf_pipeline.from_model_id.return_value = mock_model
        
        provider = HuggingFaceProvider()
        result = provider.create_chat_model(temperature=0.4, device=0)
        
        mock_hf_pipeline.from_model_id.assert_called_once_with(
            model_id="microsoft/DialoGPT-medium",
            task="text-generation",
            model_kwargs={
                "temperature": 0.4,
                "max_length": 2000,
            },
            device=0
        )
        assert result == mock_model
    
    @patch('app.core.llm.providers.huggingface_provider.get_settings')
    @patch('app.core.llm.providers.huggingface_provider.HuggingFaceEmbeddings')
    def test_create_embedding_model(self, mock_hf_embeddings, mock_get_settings):
        """HuggingFace 임베딩 모델 생성 테스트"""
        mock_get_settings.return_value = self.mock_settings
        mock_embedding_model = Mock()
        mock_hf_embeddings.return_value = mock_embedding_model
        
        provider = HuggingFaceProvider()
        result = provider.create_embedding_model(device="cuda")
        
        mock_hf_embeddings.assert_called_once_with(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': "cuda"}
        )
        assert result == mock_embedding_model
    
    @patch('app.core.llm.providers.huggingface_provider.get_settings')
    def test_validate_config_success(self, mock_get_settings):
        """HuggingFace 설정 검증 성공 테스트 (API 토큰 선택사항)"""
        mock_get_settings.return_value = self.mock_settings
        
        provider = HuggingFaceProvider()
        result = provider.validate_config()
        
        assert result is True
    
    @patch('app.core.llm.providers.huggingface_provider.get_settings')
    @patch('app.core.llm.providers.huggingface_provider.HuggingFaceEmbeddings')
    def test_embedding_model_fallback_for_openai_model(self, mock_hf_embeddings, mock_get_settings):
        """OpenAI 임베딩 모델명이 설정된 경우 HuggingFace 모델로 폴백 테스트"""
        self.mock_settings.EMBEDDING_MODEL_NAME = "text-embedding-3-small"  # OpenAI 모델명
        mock_get_settings.return_value = self.mock_settings
        mock_embedding_model = Mock()
        mock_hf_embeddings.return_value = mock_embedding_model
        
        provider = HuggingFaceProvider()
        result = provider.create_embedding_model()
        
        # OpenAI 모델명이 HuggingFace 기본 모델로 변경되었는지 확인
        mock_hf_embeddings.assert_called_once_with(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': "cpu"}
        )
        assert result == mock_embedding_model