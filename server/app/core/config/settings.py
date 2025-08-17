from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import Optional

class Settings(BaseSettings):
    # LLM 제공업체 설정
    LLM_PROVIDER: str = "openai"  # openai, anthropic, ollama, huggingface
    
    # Chat 모델 설정
    CHAT_MODEL_NAME: str = "gpt-4o"  # 제공업체별 기본값
    CHAT_MODEL_TEMPERATURE: float = 0.5
    CHAT_MODEL_MAX_TOKENS: int = 2000
    
    # 용도별 모델 설정
    PIPELINE_MODEL_NAME: str = "gpt-4o-mini"  # 로그 처리용 (빠른 처리)
    TROUBLESHOOTING_MODEL_NAME: str = "gpt-4o"  # 트러블슈팅용 (정확한 분석)
    
    # 임베딩 모델 설정
    EMBEDDING_MODEL_NAME: str = "text-embedding-3-small"
    EMBEDDING_VECTOR_DIMS: int = 1536  # 임베딩 벡터 차원수 (모델별로 설정 필요)
    
    # OpenAI 설정
    OPENAI_API_KEY: str = ""
    
    # Anthropic 설정
    ANTHROPIC_API_KEY: str = ""
    
    # Ollama 설정 (로컬 실행)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    OLLAMA_TIMEOUT: int = 60
    
    # HuggingFace 설정
    HUGGINGFACE_API_TOKEN: str = ""
    
    # Elasticsearch 설정
    ELASTIC_HOST: str
    ELASTIC_USERNAME: str
    ELASTIC_PASSWORD: str
    
    # 데이터베이스 설정
    MYSQL_USER: str
    MYSQL_PASSWORD: str
    MYSQL_HOST: str
    MYSQL_PORT: str
    MYSQL_SCHEMA: str
    
    # JWT 설정
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRE_MINUTES: int = 30
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)
    
    def validate_llm_config(self) -> bool:
        """LLM 제공업체별 필수 환경변수 검증"""
        provider = self.LLM_PROVIDER.lower()
        
        if provider == "openai" and not self.OPENAI_API_KEY:
            raise ValueError("OPENAI_API_KEY is required when LLM_PROVIDER is 'openai'")
        elif provider == "anthropic" and not self.ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY is required when LLM_PROVIDER is 'anthropic'")
        elif provider == "huggingface" and not self.HUGGINGFACE_API_TOKEN:
            # HuggingFace API 토큰은 선택사항 (로컬 모델 사용 가능)
            pass
        
        return True

@lru_cache # 싱글턴
def get_settings() -> Settings:
    """설정 객체 반환"""
    return Settings() 