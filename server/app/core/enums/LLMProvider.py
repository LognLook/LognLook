from enum import Enum


class LLMProvider(str, Enum):
    """지원되는 LLM 제공업체"""
    OPENAI = "openai"
    ANTHROPIC = "anthropic"
    OLLAMA = "ollama"
    HUGGINGFACE = "huggingface"