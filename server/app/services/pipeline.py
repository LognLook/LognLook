from fastapi import HTTPException
from sqlalchemy.orm import Session
from uuid import UUID
from langchain_core.prompts import PromptTemplate
from langchain_core.messages import HumanMessage

from app.core.llm.base import LLMFactory
from app.core.enums.language import Language
from app.infra.database.opensearch import OpenSearchClient
from app.core.llm.prompts import LOG_COMMENT_TEMPLATE, AIMessage
from app.models.project import Project

from app.core.utils import log_utils as LogUtils
import asyncio
from collections import defaultdict



class PipelineService:
    def __init__(self, db: Session):
        self.db = db
        self.client = OpenSearchClient()

    async def process_log(self, log_data: dict, api_key: str):
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
        ai_msg = await self._gen_ai_msg(log_message, category_list, language)
        # ai_msg = AIMessage(
        #     comment="유저가 비밀번호를 잘못 입력했습니다.",
        #     category="유저 입력 에러"
        # )
        vector = await self._embed_comment(ai_msg.comment)
        log_data["comment"] = ai_msg.comment
        log_data["keyword"] = ai_msg.keyword
        log_data["vector"] = vector
        log_data["message_timestamp"] = LogUtils.extract_timestamp_from_message(
            log_message
        )
        log_data["log_level"] = LogUtils.extract_log_level(log_message)
        # elasticsearch에 저장
        body = log_data
        index = project.index
        self.client.save_document(index=index, document=body)

        return log_data

    async def _gen_ai_msg(self, log_msg: str, category_list: list, language: Language):
        """
        로그 메세지에 대한 코멘트를 생성하는 함수
        """
        comment_model = LLMFactory.create_pipeline_model()
        prompt = PromptTemplate(
            template=LOG_COMMENT_TEMPLATE,
            input_variables=["log_message", "category_list", "language"],
        )
        if category_list == []:
            formatted_prompt = prompt.format(
                log_message=log_msg,
                category_list=None,
                language=language.value,
            )
        else:
            formatted_prompt = prompt.format(
                log_message=log_msg,
                category_list=str(category_list),
                language=language.value,
            )
        chain = comment_model.with_structured_output(AIMessage)
        return await chain.ainvoke([HumanMessage(content=formatted_prompt)])

    async def _embed_comment(self, comment: str):
        """
        코멘트를 임베딩하는 함수
        """
        embedding_model = LLMFactory.create_embedding_model()
        vector = await embedding_model.aembed_query(comment)
        return vector

    async def process_logs_batch(self, logs_batch: list):
        """
        배치로 로그 처리
        """
        # 1. API 키별로 그룹화하여 DB 쿼리 최소화
        logs_by_api_key = defaultdict(list)
        for log_item in logs_batch:
            logs_by_api_key[log_item["api_key"]].append(log_item)
        
        # 2. 각 API 키별로 병렬 처리
        tasks = []
        for api_key, logs_group in logs_by_api_key.items():
            task = self._process_logs_group(logs_group, api_key)
            tasks.append(task)
        
        # 병렬로 모든 그룹 처리
        await asyncio.gather(*tasks)

    async def _process_logs_group(self, logs_group: list, api_key: str):
        """
        같은 API 키를 가진 로그 그룹을 처리
        """
        # 프로젝트 정보 한 번만 조회
        project = self.db.query(Project).filter(Project.api_key == api_key).first()
        if not project:
            return  # 프로젝트가 없으면 스킵
        
        category_list = project.setting.log_keywords
        language = project.language
        index = project.index
        
        # AI 작업들을 병렬로 처리
        ai_tasks = []
        for log_item in logs_group:
            log_data = log_item["data"]
            log_message = log_data.get("message", "")
            
            # AI 코멘트 생성과 임베딩을 병렬로 처리
            ai_task = self._process_single_log_ai(log_data, log_message, category_list, language)
            ai_tasks.append(ai_task)
        
        # 모든 AI 작업을 병렬로 실행
        processed_logs = await asyncio.gather(*ai_tasks)
        
        # OpenSearch에 벌크로 저장
        self.client.bulk_save_documents(index, processed_logs)

    async def _process_single_log_ai(self, log_data: dict, log_message: str, category_list: list, language):
        """
        단일 로그의 AI 처리 (병렬 실행용)
        """
        # AI 코멘트 생성과 임베딩을 동시에 시작
        ai_msg_task = self._gen_ai_msg(log_message, category_list, language)
        
        # AI 메시지 완료 대기
        ai_msg = await ai_msg_task
        
        # 임베딩 생성
        vector = await self._embed_comment(ai_msg.comment)
        
        # 결과 데이터 구성
        log_data["comment"] = ai_msg.comment
        log_data["keyword"] = ai_msg.keyword
        log_data["vector"] = vector
        log_data["message_timestamp"] = LogUtils.extract_timestamp_from_message(log_message)
        log_data["log_level"] = LogUtils.extract_log_level(log_message)
        
        return log_data
