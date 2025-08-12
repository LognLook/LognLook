"""LLM 관련 예외 정의"""


class LLMProviderError(Exception):
    """LLM 제공업체 관련 기본 예외"""
    pass


class UnsupportedProviderError(LLMProviderError):
    """지원하지 않는 LLM 제공업체 예외"""
    pass


class ConfigurationError(LLMProviderError):
    """LLM 설정 오류 예외"""
    pass


class APIKeyMissingError(ConfigurationError):
    """API 키 누락 예외"""
    pass


class ModelNotFoundError(LLMProviderError):
    """모델을 찾을 수 없는 예외"""
    pass


class ProviderConnectionError(LLMProviderError):
    """제공업체 연결 오류 예외"""
    pass