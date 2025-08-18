from typing import Any
from langchain_ollama import ChatOllama
from langchain_huggingface import HuggingFaceEmbeddings

from app.core.config.settings import get_settings
from .base_provider import BaseLLMProvider

settings = get_settings()


class OllamaProvider(BaseLLMProvider):
    """Ollama LLM 제공업체 구현체 (로컬 실행)"""

    def create_chat_model(self, temperature: float = 0.5, **kwargs) -> ChatOllama:
        """Ollama Chat 모델 생성

        Args:
            temperature: 온도 (높을수록 더 창의적인 응답)
            **kwargs: 추가 설정 파라미터
                - model_name: 모델 이름 (기본값: settings.CHAT_MODEL_NAME)

        Returns:
            ChatOllama 인스턴스
        """
        model_name = kwargs.get('model_name', settings.CHAT_MODEL_NAME)
        
        return ChatOllama(
            model=model_name,
            base_url=settings.OLLAMA_BASE_URL,
            temperature=temperature,
        )

    def create_embedding_model(self, **kwargs) -> HuggingFaceEmbeddings:
        """HuggingFace 임베딩 모델 생성 (로컬 실행)

        Args:
            **kwargs: 추가 설정 파라미터
                - model_name: 모델 이름 (기본값: sentence-transformers/all-MiniLM-L6-v2)

        Returns:
            HuggingFaceEmbeddings 인스턴스
        """
        model_name = kwargs.get('model_name', 'sentence-transformers/all-MiniLM-L6-v2')
        
        return HuggingFaceEmbeddings(
            model_name=model_name,
        )

    def validate_config(self) -> bool:
        """Ollama 설정 검증

        Returns:
            설정이 유효한 경우 True (Ollama는 API 키 불필요)
        """
        # Ollama는 로컬 실행이므로 API 키가 필요 없음
        # base_url 접근 가능성은 실제 사용 시점에 검증
        return True