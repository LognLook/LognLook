from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    # OpenAI 설정
    OPENAI_API_KEY: str
    
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

@lru_cache # 싱글턴
def get_settings() -> Settings:
    """설정 객체 반환"""
    return Settings() 