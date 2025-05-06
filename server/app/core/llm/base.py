from langchain_openai import ChatOpenAI
from langchain_openai.embeddings import OpenAIEmbeddings
from app.core.config.settings import get_settings

settings = get_settings()

class LLMFactory:
    """LLM 팩토리 클래스"""
    
    @staticmethod
    def create_chat_model(
        temperature: float = 0.5,
        model_name: str = "gpt-4o"
    ) -> ChatOpenAI:
        """모델 생성
        
        Args:
            temperature: 온도 (높을수록 더 창의적인 응답)
            model_name: 모델 이름
            
        Returns:
            ChatOpenAI 인스턴스
        """
        return ChatOpenAI(
            model=model_name,
            temperature=temperature,
            api_key=settings.OPENAI_API_KEY,
        )
    
    @staticmethod
    def create_mini_chat_model(
        temperature: float = 0.5,
        model_name: str = "gpt-4o-mini"
    ) -> ChatOpenAI:
        """미니 모델 생성
        
        Args:
            temperature: 온도 (높을수록 더 창의적인 응답)
            model_name: 모델 이름
            
        Returns:
            ChatOpenAI 인스턴스
        """
        return ChatOpenAI(
            model=model_name,
            temperature=temperature,
            api_key=settings.OPENAI_API_KEY,
        )
    
    @staticmethod
    def create_embedding_model(
        model_name="text-embedding-3-small",
    ) -> OpenAIEmbeddings:
        """임베딩 모델 생성
        
        Args:
            model_name: 모델 이름
            
        Returns:
            ChatOpenAI 인스턴스
        """
        return OpenAIEmbeddings(
            model=model_name,
            openai_api_key=settings.OPENAI_API_KEY,
        )