from typing import Any
from app.core.config.settings import get_settings
from app.core.llm.providers.openai_provider import OpenAIProvider
from app.core.llm.providers.anthropic_provider import AnthropicProvider
from app.core.llm.providers.ollama_provider import OllamaProvider
from app.core.llm.providers.huggingface_provider import HuggingFaceProvider

settings = get_settings()


class LLMFactory:
    """다중 LLM 제공업체를 지원하는 팩토리 클래스"""
    
    # 제공업체 매핑
    _providers = {
        "openai": OpenAIProvider,
        "anthropic": AnthropicProvider,
        "ollama": OllamaProvider,
        "huggingface": HuggingFaceProvider,
    }
    
    @classmethod
    def _get_provider(cls):
        """현재 설정된 제공업체 인스턴스 반환"""
        provider_name = settings.LLM_PROVIDER.lower()
        
        if provider_name not in cls._providers:
            raise ValueError(f"Unsupported LLM provider: {provider_name}")
        
        provider_class = cls._providers[provider_name]
        provider = provider_class()
        
        # 설정 검증
        provider.validate_config()
        
        return provider
    
    @classmethod
    def create_chat_model(cls, temperature: float = None, **kwargs) -> Any:
        """Chat 모델 생성
        
        Args:
            temperature: 온도 (기본값: settings.CHAT_MODEL_TEMPERATURE)
            **kwargs: 제공업체별 추가 설정 파라미터
            
        Returns:
            제공업체별 Chat 모델 인스턴스
        """
        if temperature is None:
            temperature = settings.CHAT_MODEL_TEMPERATURE
            
        provider = cls._get_provider()
        return provider.create_chat_model(temperature=temperature, **kwargs)
    
    @classmethod
    def create_mini_chat_model(cls, temperature: float = 0.5, **kwargs) -> Any:
        """미니 모델 생성 (하위 호환성 유지)
        
        Args:
            temperature: 온도
            **kwargs: 추가 설정 파라미터
            
        Returns:
            제공업체별 Chat 모델 인스턴스
        """
        # OpenAI의 경우 gpt-4o-mini 모델 사용
        if settings.LLM_PROVIDER.lower() == "openai":
            kwargs.setdefault('model_name', 'gpt-4o-mini')
        
        return cls.create_chat_model(temperature=temperature, **kwargs)
    
    @classmethod
    def create_embedding_model(cls, **kwargs) -> Any:
        """임베딩 모델 생성
        
        Args:
            **kwargs: 제공업체별 추가 설정 파라미터
            
        Returns:
            제공업체별 임베딩 모델 인스턴스
        """
        provider = cls._get_provider()
        return provider.create_embedding_model(**kwargs)
    
    @classmethod
    def get_supported_providers(cls) -> list:
        """지원되는 제공업체 목록 반환"""
        return list(cls._providers.keys())