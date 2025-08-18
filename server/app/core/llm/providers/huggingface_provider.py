from typing import Any
from langchain_huggingface import HuggingFacePipeline, HuggingFaceEmbeddings

from app.core.config.settings import get_settings
from .base_provider import BaseLLMProvider

settings = get_settings()


class HuggingFaceProvider(BaseLLMProvider):
    """HuggingFace LLM 제공업체 구현체 (로컬 실행)"""

    def create_chat_model(self, temperature: float = 0.5, **kwargs) -> HuggingFacePipeline:
        """HuggingFace Chat 모델 생성

        Args:
            temperature: 온도 (높을수록 더 창의적인 응답)
            **kwargs: 추가 설정 파라미터
                - model_name: 모델 이름 (기본값: settings.CHAT_MODEL_NAME)
                - max_tokens: 최대 토큰 수
                - device: 디바이스 설정 (-1: CPU, 0: GPU)

        Returns:
            HuggingFacePipeline 인스턴스
        """
        model_name = kwargs.get('model_name', settings.CHAT_MODEL_NAME)
        max_tokens = kwargs.get('max_tokens', settings.CHAT_MODEL_MAX_TOKENS)
        device = kwargs.get('device', -1)  # 기본적으로 CPU 사용
        
        return HuggingFacePipeline.from_model_id(
            model_id=model_name,
            task="text-generation",
            model_kwargs={
                "temperature": temperature,
                "max_length": max_tokens,
            },
            device=device,
        )

    def create_embedding_model(self, **kwargs) -> HuggingFaceEmbeddings:
        """HuggingFace 임베딩 모델 생성

        Args:
            **kwargs: 추가 설정 파라미터
                - model_name: 모델 이름 (기본값: settings.EMBEDDING_MODEL_NAME)
                - device: 디바이스 설정 (cpu, cuda)

        Returns:
            HuggingFaceEmbeddings 인스턴스
        """
        model_name = kwargs.get('model_name', settings.EMBEDDING_MODEL_NAME)
        device = kwargs.get('device', 'cpu')
        
        # HuggingFace 임베딩 모델명이 OpenAI 형식일 경우 기본 모델로 변경
        if model_name.startswith('text-embedding-'):
            model_name = 'sentence-transformers/all-MiniLM-L6-v2'
        
        return HuggingFaceEmbeddings(
            model_name=model_name,
            model_kwargs={'device': device},
        )

    def validate_config(self) -> bool:
        """HuggingFace 설정 검증

        Returns:
            설정이 유효한 경우 True (HuggingFace는 API 토큰 선택사항)
        """
        # HuggingFace API 토큰은 선택사항 (로컬 모델 사용 가능)
        # 모델 다운로드 가능성은 실제 사용 시점에 검증
        return True