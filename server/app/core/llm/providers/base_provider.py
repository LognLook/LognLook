from abc import ABC, abstractmethod
from typing import Any


class BaseLLMProvider(ABC):
    """LLM 추상 기본 클래스"""

    @abstractmethod
    def create_chat_model(self, temperature: float = 0.5, **kwargs) -> Any:
        """Chat 모델 생성

        Args:
            temperature: 온도 (높을수록 더 창의적인 응답)
            **kwargs: 추가 설정 파라미터

        Returns:
            Chat 모델 인스턴스
        """
        pass

    @abstractmethod
    def create_embedding_model(self, **kwargs) -> Any:
        """임베딩 모델 생성

        Args:
            **kwargs: 추가 설정 파라미터

        Returns:
            임베딩 모델 인스턴스
        """
        pass

    @abstractmethod
    def validate_config(self) -> bool:
        """제공업체별 설정 검증

        Returns:
            설정이 유효한 경우 True

        Raises:
            ValueError: 필수 설정이 누락된 경우
        """
        pass