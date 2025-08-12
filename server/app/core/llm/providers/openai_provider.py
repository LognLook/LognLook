from typing import Any
from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from app.core.config.settings import get_settings
from .base_provider import BaseLLMProvider

settings = get_settings()


class OpenAIProvider(BaseLLMProvider):
    """OpenAI LLM 구현체"""

    def create_chat_model(self, temperature: float = 0.5, **kwargs) -> ChatOpenAI:
        """OpenAI Chat 모델 생성

        Args:
            temperature: 온도 (높을수록 더 창의적인 응답)
            **kwargs: 추가 설정 파라미터
                - model_name: 모델 이름 (기본값: settings.CHAT_MODEL_NAME)
                - max_tokens: 최대 토큰 수 (기본값: settings.CHAT_MODEL_MAX_TOKENS)

        Returns:
            ChatOpenAI 인스턴스
        """
        model_name = kwargs.get('model_name', settings.CHAT_MODEL_NAME)
        max_tokens = kwargs.get('max_tokens', settings.CHAT_MODEL_MAX_TOKENS)
        
        return ChatOpenAI(
            model=model_name,
            temperature=temperature,
            max_tokens=max_tokens,
            api_key=settings.OPENAI_API_KEY,
        )

    def create_embedding_model(self, **kwargs) -> OpenAIEmbeddings:
        """OpenAI 임베딩 모델 생성

        Args:
            **kwargs: 추가 설정 파라미터
                - model_name: 모델 이름 (기본값: settings.EMBEDDING_MODEL_NAME)

        Returns:
            OpenAIEmbeddings 인스턴스
        """
        model_name = kwargs.get('model_name', settings.EMBEDDING_MODEL_NAME)
        
        return OpenAIEmbeddings(
            model=model_name,
            openai_api_key=settings.OPENAI_API_KEY,
        )

    def validate_config(self) -> bool:
        """OpenAI 설정 검증

        Returns:
            설정이 유효한 경우 True

        Raises:
            ValueError: API 키가 누락된 경우
        """
        if not settings.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required for OpenAI provider")
        return True