from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage
from app.core.llm.base import LLMFactory
from app.core.llm.prompts import LOG_COMMENT_TEMPLATE, AIMessage
from app.infra.database.elaticsearch import ElasticsearchClient
from app.core.config.settings import get_settings
from app.core.enums.language import Language


class FromDB:
    """데이터베이스에서 가져올 데이터 정의 클래스"""
    def __init__(self):
        self.category_list = ["유저 입력 에러", "로그인 에러"]
        # enum으로 정의된 카테고리 리스트
        self.language = Language.ENGLISH
        self.index = "test-index"
    

def process_log(self, log_data: dict):
    '''
    로그 메세지를 처리하는 메소드
    1. 로그 메세지를 분류 모델을 사용하여 키워드로 변환
    2. 임베딩 모델을 사용하여 메세지 내용을 임베딩
    '''
    # 데이터베이스에서 유저 설정 카테고리, 언어, 인덱스 정보를 가져옴
    from_db = FromDB() 
    log_message = log_data.get("message", "")
    ai_msg = self.gen_ai_msg(log_message, from_db.category_list, from_db.language)
    # ai_msg = AIMessage(
    #     comment="유저가 비밀번호를 잘못 입력했습니다.",
    #     category="유저 입력 에러"
    # )
    embedding = self.embed_comment(ai_msg.comment)
    log_data["comment"] = ai_msg.comment
    log_data["category"] = ai_msg.category
    log_data["embedding"] = embedding
    
    # elasticsearch에 저장
    es_client = ElasticsearchClient()
    body = log_data
    index = from_db.index
    es_client.es.index(index=index, body=body)
    
    return log_data

def gen_ai_msg(self, log_msg: str, category_list: list, language: Language):
    '''
    로그 메세지에 대한 코멘트를 생성하는 함수
    '''
    comment_model = LLMFactory.create_mini_chat_model()

    prompt = PromptTemplate(
        template=LOG_COMMENT_TEMPLATE,
        input_variables=["log_message", "category_list", "language"],
    )
    formatted_prompt = prompt.format(log_message=log_msg, category_list=str(category_list), language=language.value)
    chain = comment_model.with_structured_output(AIMessage)
    return chain.invoke([HumanMessage(content=formatted_prompt)])

def embed_comment(self, comment: str):
    '''
    코멘트를 임베딩하는 함수
    '''
    embedding_model = LLMFactory.create_embedding_model()
    embedding = embedding_model.embed_query(comment)
    return embedding