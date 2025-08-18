import pytest
from unittest.mock import Mock, patch, MagicMock
from sqlalchemy.orm import Session
from app.services.pipeline import PipelineService
from app.services.trouble import TroubleService
from app.core.enums.language import Language
from app.core.enums.LLMProvider import LLMProvider
from app.schemas.trouble import TroubleCreate
from app.core.llm.prompts import AIMessage, TroubleContent


class TestPipelineServiceMultiLLM:
    """PipelineService 다중 LLM 통합 테스트"""
    
    def setup_method(self):
        self.mock_db = Mock(spec=Session)
        self.pipeline_service = PipelineService(self.mock_db)
    
    @patch('app.services.pipeline.LLMFactory.create_pipeline_model')
    @patch('app.services.pipeline.LLMFactory.create_embedding_model')
    def test_gen_ai_msg_uses_pipeline_model(self, mock_create_embedding, mock_create_pipeline):
        """_gen_ai_msg가 파이프라인 모델을 사용하는지 테스트"""
        # Mock 설정
        mock_model = Mock()
        mock_create_pipeline.return_value = mock_model
        mock_chain = Mock()
        mock_model.with_structured_output.return_value = mock_chain
        mock_ai_message = AIMessage(comment="테스트 코멘트", keyword="테스트")
        mock_chain.invoke.return_value = mock_ai_message
        
        # 테스트 실행
        result = self.pipeline_service._gen_ai_msg(
            log_msg="Test log message",
            category_list=["error", "database"],
            language=Language.KOREAN
        )
        
        # 검증
        mock_create_pipeline.assert_called_once()
        mock_model.with_structured_output.assert_called_once_with(AIMessage)
        assert result == mock_ai_message
    
    @patch('app.services.pipeline.LLMFactory.create_embedding_model')
    def test_embed_comment_uses_embedding_model(self, mock_create_embedding):
        """_embed_comment가 임베딩 모델을 사용하는지 테스트"""
        # Mock 설정
        mock_embedding_model = Mock()
        mock_create_embedding.return_value = mock_embedding_model
        test_vector = [0.1, 0.2, 0.3, 0.4, 0.5]
        mock_embedding_model.embed_query.return_value = test_vector
        
        # 테스트 실행
        result = self.pipeline_service._embed_comment("테스트 코멘트")
        
        # 검증
        mock_create_embedding.assert_called_once()
        mock_embedding_model.embed_query.assert_called_once_with("테스트 코멘트")
        assert result == test_vector
    
    @patch('app.services.pipeline.Project')
    @patch('app.services.pipeline.LLMFactory.create_pipeline_model')
    @patch('app.services.pipeline.LLMFactory.create_embedding_model')
    @patch.object(PipelineService, '_gen_ai_msg')
    @patch.object(PipelineService, '_embed_comment')
    def test_process_log_integration(self, mock_embed, mock_gen_ai, mock_create_embedding, 
                                   mock_create_pipeline, mock_project_class):
        """process_log 메서드 통합 테스트"""
        # Mock 프로젝트 설정
        mock_project = Mock()
        mock_project.setting.log_keywords = ["error", "warning"]
        mock_project.language = Language.KOREAN
        mock_project.index = "test-index"
        self.mock_db.query.return_value.filter.return_value.first.return_value = mock_project
        
        # Mock AI 응답 설정
        mock_ai_msg = AIMessage(comment="데이터베이스 연결 오류", keyword="database_error")
        mock_gen_ai.return_value = mock_ai_msg
        mock_embed.return_value = [0.1, 0.2, 0.3]
        
        # Mock Elasticsearch 설정
        self.pipeline_service.es = Mock()
        
        # 테스트 데이터
        log_data = {"message": "Database connection failed", "timestamp": "2024-01-01T10:00:00"}
        api_key = "test-api-key"
        
        # 테스트 실행
        result = self.pipeline_service.process_log(log_data, api_key)
        
        # 검증
        assert result["comment"] == "데이터베이스 연결 오류"
        assert result["keyword"] == "database_error"
        assert result["vector"] == [0.1, 0.2, 0.3]
        mock_gen_ai.assert_called_once()
        mock_embed.assert_called_once_with("데이터베이스 연결 오류")
        self.pipeline_service.es.save_document.assert_called_once()


class TestTroubleServiceMultiLLM:
    """TroubleService 다중 LLM 통합 테스트"""
    
    def setup_method(self):
        self.mock_db = Mock(spec=Session)
    
    @patch('app.services.trouble.LLMFactory.create_troubleshooting_model')
    def test_trouble_service_uses_troubleshooting_model(self, mock_create_troubleshooting):
        """TroubleService가 트러블슈팅 모델을 사용하는지 테스트"""
        mock_model = Mock()
        mock_create_troubleshooting.return_value = mock_model
        
        # TroubleService 생성
        trouble_service = TroubleService(self.mock_db)
        
        # 검증
        mock_create_troubleshooting.assert_called_once()
        assert trouble_service.llm == mock_model
    
    @patch('app.services.trouble.LLMFactory.create_troubleshooting_model')
    def test_gen_ai_content_uses_troubleshooting_model(self, mock_create_troubleshooting):
        """_gen_ai_content가 트러블슈팅 모델을 사용하는지 테스트"""
        # Mock 설정
        mock_model = Mock()
        mock_create_troubleshooting.return_value = mock_model
        mock_chain = Mock()
        mock_model.with_structured_output.return_value = mock_chain
        mock_trouble_content = TroubleContent(
            title="데이터베이스 연결 문제 분석",
            content="상세한 트러블슈팅 내용"
        )
        mock_chain.invoke.return_value = mock_trouble_content
        
        # TroubleService 생성
        trouble_service = TroubleService(self.mock_db)
        
        # 테스트 실행
        result = trouble_service._gen_ai_content(
            user_query="데이터베이스에 연결할 수 없습니다",
            log_contents=["ERROR: Connection timeout", "ERROR: Database unreachable"],
            language="korean"
        )
        
        # 검증
        mock_model.with_structured_output.assert_called_once_with(TroubleContent)
        mock_chain.invoke.assert_called_once()
        assert result == mock_trouble_content


class TestMultiProviderScenarios:
    """다중 제공업체 시나리오 테스트"""
    
    @patch('app.core.llm.base.get_settings')
    def test_openai_provider_scenario(self, mock_get_settings):
        """OpenAI 제공업체 시나리오 테스트"""
        from app.core.config.settings import Settings
        from app.core.llm.base import LLMFactory
        
        # OpenAI 설정
        mock_settings = Mock(spec=Settings)
        mock_settings.LLM_PROVIDER = LLMProvider.OPENAI
        mock_settings.OPENAI_API_KEY = "test-key"
        mock_settings.PIPELINE_MODEL_NAME = "gpt-4o-mini"
        mock_settings.TROUBLESHOOTING_MODEL_NAME = "gpt-4o"
        mock_get_settings.return_value = mock_settings
        
        with patch('app.core.llm.providers.openai_provider.OpenAIProvider') as mock_provider_class:
            mock_provider = Mock()
            mock_provider_class.return_value = mock_provider
            mock_provider.validate_config.return_value = True
            
            # Pipeline 모델 테스트
            mock_pipeline_model = Mock()
            mock_provider.create_chat_model.return_value = mock_pipeline_model
            
            pipeline_model = LLMFactory.create_pipeline_model()
            
            # 검증
            mock_provider.create_chat_model.assert_called_with(
                model_name="gpt-4o-mini",
                temperature=0.3
            )
            assert pipeline_model == mock_pipeline_model
    
    @patch('app.core.llm.base.get_settings')
    def test_ollama_provider_scenario(self, mock_get_settings):
        """Ollama 제공업체 시나리오 테스트"""
        from app.core.config.settings import Settings
        from app.core.llm.base import LLMFactory
        
        # Ollama 설정
        mock_settings = Mock(spec=Settings)
        mock_settings.LLM_PROVIDER = LLMProvider.OLLAMA
        mock_settings.OLLAMA_BASE_URL = "http://localhost:11434"
        mock_settings.PIPELINE_MODEL_NAME = "llama3.2:1b"
        mock_settings.TROUBLESHOOTING_MODEL_NAME = "llama3.2:8b"
        mock_get_settings.return_value = mock_settings
        
        with patch('app.core.llm.providers.ollama_provider.OllamaProvider') as mock_provider_class:
            mock_provider = Mock()
            mock_provider_class.return_value = mock_provider
            mock_provider.validate_config.return_value = True
            
            # Troubleshooting 모델 테스트
            mock_troubleshooting_model = Mock()
            mock_provider.create_chat_model.return_value = mock_troubleshooting_model
            
            troubleshooting_model = LLMFactory.create_troubleshooting_model()
            
            # 검증
            mock_provider.create_chat_model.assert_called_with(
                model_name="llama3.2:8b",
                temperature=0.5
            )
            assert troubleshooting_model == mock_troubleshooting_model
    
    @patch('app.core.llm.base.get_settings')
    def test_provider_switching_scenario(self, mock_get_settings):
        """제공업체 전환 시나리오 테스트"""
        from app.core.config.settings import Settings
        from app.core.llm.base import LLMFactory
        
        mock_settings = Mock(spec=Settings)
        mock_get_settings.return_value = mock_settings
        
        # OpenAI -> Anthropic 전환 시뮬레이션
        mock_settings.LLM_PROVIDER = LLMProvider.OPENAI
        mock_settings.OPENAI_API_KEY = "test-openai-key"
        mock_settings.PIPELINE_MODEL_NAME = "gpt-4o-mini"
        
        with patch('app.core.llm.providers.openai_provider.OpenAIProvider') as mock_openai_provider:
            mock_openai = Mock()
            mock_openai_provider.return_value = mock_openai
            mock_openai.validate_config.return_value = True
            mock_openai_model = Mock()
            mock_openai.create_chat_model.return_value = mock_openai_model
            
            # OpenAI 모델 생성
            openai_model = LLMFactory.create_pipeline_model()
            assert openai_model == mock_openai_model
        
        # Anthropic으로 전환
        mock_settings.LLM_PROVIDER = LLMProvider.ANTHROPIC
        mock_settings.ANTHROPIC_API_KEY = "test-anthropic-key"
        
        with patch('app.core.llm.providers.anthropic_provider.AnthropicProvider') as mock_anthropic_provider:
            mock_anthropic = Mock()
            mock_anthropic_provider.return_value = mock_anthropic
            mock_anthropic.validate_config.return_value = True
            mock_anthropic_model = Mock()
            mock_anthropic.create_chat_model.return_value = mock_anthropic_model
            
            # Anthropic 모델 생성
            anthropic_model = LLMFactory.create_pipeline_model()
            assert anthropic_model == mock_anthropic_model
            
            # 다른 모델이 생성되었는지 확인
            assert openai_model != anthropic_model