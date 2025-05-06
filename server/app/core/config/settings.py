from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # OpenAI 설정
    OPENAI_API_KEY: str
    
    # Elasticsearch 설정
    ELASTIC_HOST: str
    ELASTIC_USERNAME: str
    ELASTIC_PASSWORD: str
    
    # 데이터베이스 설정
    # DB_HOST: str
    # DB_PORT: str
    # DB_NAME: str
    # DB_USER: str
    # DB_PASSWORD: str
    # DATABASE_URL: str
    
    model_config = SettingsConfigDict(env_file=".env", case_sensitive=True)

def get_settings() -> Settings:
    """설정 객체 반환"""
    return Settings() 