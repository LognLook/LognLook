from fastapi import HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage

from app.core.llm.base import LLMFactory
from app.core.enums.language import Language
from app.infra.database.elaticsearch import ElasticsearchClient
from app.core.llm.prompts import LOG_COMMENT_TEMPLATE, AIMessage
from app.models.project import Project

from app.core.utils import log_utils as LogUtils


class PipelineService:
    def __init__(self, db: Session):
        self.db = db
        self.es = ElasticsearchClient()

    def process_log(self, log_data: dict, api_key: str):
        """
        로그 메세지를 처리하는 메소드
        1. 로그 메세지를 분류 모델을 사용하여 키워드로 변환
        2. 임베딩 모델을 사용하여 메세지 내용을 임베딩
        """
        # 데이터베이스에서 유저 설정 카테고리, 언어, 인덱스 정보를 가져옴
        log_message = log_data.get("message", "")

        project = self.db.query(Project).filter(Project.api_key == api_key).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        category_list = project.setting.log_keywords
        language = project.language
        ai_msg = self.gen_ai_msg(log_message, category_list, language)
        # ai_msg = AIMessage(
        #     comment="유저가 비밀번호를 잘못 입력했습니다.",
        #     category="유저 입력 에러"
        # )
        vector = self._embed_comment(ai_msg.comment)
        log_data["comment"] = ai_msg.comment
        log_data["category"] = ai_msg.category
        log_data["vector"] = vector
        log_data["message_timestamp"] = LogUtils.extract_timestamp_from_message(
            log_message
        )
        log_data["log_level"] = LogUtils.extract_log_level(log_message)
        # elasticsearch에 저장
        body = log_data
        index = project.index
        self.es.save_document(index=index, document=body)

        return log_data

    def _gen_ai_msg(self, log_msg: str, category_list: list, language: Language):
        """
        로그 메세지에 대한 코멘트를 생성하는 함수
        """
        comment_model = LLMFactory.create_mini_chat_model()

        prompt = PromptTemplate(
            template=LOG_COMMENT_TEMPLATE,
            input_variables=["log_message", "category_list", "language"],
        )
        if category_list == []:
            formatted_prompt = prompt.format(
                log_message=log_msg,
                category_list="",
                language=language.value,
            )
        else:
            formatted_prompt = prompt.format(
                log_message=log_msg,
                category_list=str(category_list),
                language=language.value,
            )
        chain = comment_model.with_structured_output(AIMessage)
        return chain.invoke([HumanMessage(content=formatted_prompt)])

    def _embed_comment(self, comment: str):
        """
        코멘트를 임베딩하는 함수
        """
        embedding_model = LLMFactory.create_embedding_model()
        vector = embedding_model.embed_query(comment)
        return vector
