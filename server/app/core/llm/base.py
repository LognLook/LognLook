from typing import Any
from app.core.config.settings import get_settings
from app.core.enums.LLMProvider import LLMProvider
from app.core.llm.providers.openai_provider import OpenAIProvider
from app.core.llm.providers.anthropic_provider import AnthropicProvider
from app.core.llm.providers.ollama_provider import OllamaProvider
from app.core.llm.providers.huggingface_provider import HuggingFaceProvider

settings = get_settings()


class LLMFactory:
    """다중 LLM 제공업체를 지원하는 팩토리 클래스"""
    
    # 제공업체 매핑
    _providers = {
        LLMProvider.OPENAI: OpenAIProvider,
        LLMProvider.ANTHROPIC: AnthropicProvider,
        LLMProvider.OLLAMA: OllamaProvider,
        LLMProvider.HUGGINGFACE: HuggingFaceProvider,
    }

    @classmethod
    def _get_provider(cls):
        """현재 설정된 제공업체 인스턴스 반환"""
        provider = settings.LLM_PROVIDER
        
        if provider not in cls._providers:
            supported = [p.value for p in LLMProvider]
            raise ValueError(f"Unsupported LLM provider: {provider}. Supported: {supported}")
        
        provider_class = cls._providers[provider]
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
    def create_pipeline_model(cls, **kwargs) -> Any:
        """파이프라인용 모델 생성 (로그 분류, 코멘트 생성)
        
        Args:
            **kwargs: 제공업체별 추가 설정 파라미터
            
        Returns:
            제공업체별 파이프라인용 Chat 모델 인스턴스
        """
        kwargs.setdefault('model_name', settings.PIPELINE_MODEL_NAME)
        kwargs.setdefault('temperature', 0.3)  # 일관된 출력을 위해 낮은 온도
        
        provider = cls._get_provider()
        return provider.create_chat_model(**kwargs)

    @classmethod
    def create_troubleshooting_model(cls, **kwargs) -> Any:
        """트러블슈팅용 모델 생성 (정확한 분석)
        
        Args:
            **kwargs: 제공업체별 추가 설정 파라미터
            
        Returns:
            제공업체별 트러블슈팅용 Chat 모델 인스턴스
        """
        kwargs.setdefault('model_name', settings.TROUBLESHOOTING_MODEL_NAME)
        kwargs.setdefault('temperature', 0.5)  # 균형잡힌 출력
        
        provider = cls._get_provider()
        return provider.create_chat_model(**kwargs)
    
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