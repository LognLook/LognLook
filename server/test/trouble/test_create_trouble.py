import pytest
from unittest.mock import Mock, patch
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.services.trouble import TroubleService
from app.schemas.trouble import TroubleCreate
from app.models.trouble import Trouble
from app.core.llm.prompts import TroubleContent


class TestCreateTrouble:
    """create_trouble 메서드 테스트 클래스"""
    
    def setup_method(self):
        """각 테스트 실행 전 설정"""
        self.mock_db = Mock(spec=Session)
        self.service = TroubleService(self.mock_db)
        
        # 테스트용 데이터
        self.test_dto = TroubleCreate(
            project_id=1,
            report_name="테스트 리포트",
            is_shared=False,
            user_query="로그인 문제를 해결해주세요",
            related_logs=["log_id_1", "log_id_2"]
        )
        
        self.created_by = 100
    
    @patch('app.services.trouble.trouble_repo.save_trouble_logs')
    @patch('app.services.trouble.trouble_repo.create_trouble')
    @patch('app.services.trouble.trouble_repo.check_user_project_access')
    @patch('app.services.trouble.get_logs_by_ids')
    @patch('app.services.trouble.get_project_by_id')
    def test_create_trouble_success(
        self, 
        mock_get_project,
        mock_get_logs,
        mock_check_access,
        mock_create_trouble,
        mock_save_logs
    ):
        """정상적인 trouble 생성 테스트"""
        
        # Mock 설정
        mock_project = Mock()
        mock_project.id = 1
        mock_get_project.return_value = mock_project
        mock_check_access.return_value = True
        mock_get_logs.return_value = ["에러 로그 내용 1", "에러 로그 내용 2"]
        
        mock_trouble = Mock(spec=Trouble)
        mock_trouble.id = 1
        mock_create_trouble.return_value = mock_trouble
        
        # AI 응답 모킹
        with patch.object(self.service, '_gen_ai_content') as mock_ai:
            mock_ai.return_value = TroubleContent(
                title="로그인 오류 분석",
                content="비밀번호 검증 로직에 문제가 있습니다."
            )
            
            # 테스트 실행
            result = self.service.create_trouble(self.test_dto, self.created_by)
            
            # 결과 검증
            assert result == mock_trouble
            mock_get_project.assert_called_once_with(self.mock_db, 1)
            mock_check_access.assert_called_once_with(self.mock_db, 1, 100)
            mock_create_trouble.assert_called_once()
            mock_save_logs.assert_called_once_with(
                self.mock_db, 1, ["log_id_1", "log_id_2"]
            )
    
    @patch('app.services.trouble.get_project_by_id')
    def test_create_trouble_project_not_found(self, mock_get_project):
        """프로젝트가 존재하지 않는 경우 테스트"""
        
        # 프로젝트가 None 반환
        mock_get_project.return_value = None
        
        # HTTPException 발생 확인
        with pytest.raises(HTTPException) as exc_info:
            self.service.create_trouble(self.test_dto, self.created_by)
        
        assert exc_info.value.status_code == 404
        assert "프로젝트를 찾을 수 없습니다" in exc_info.value.detail
    
    @patch('app.services.trouble.trouble_repo.check_user_project_access')
    @patch('app.services.trouble.get_project_by_id')
    def test_create_trouble_no_permission(self, mock_get_project, mock_check_access):
        """프로젝트 접근 권한이 없는 경우 테스트"""
        
        # Mock 설정
        mock_project = Mock()
        mock_get_project.return_value = mock_project
        mock_check_access.return_value = False  # 권한 없음
        
        # HTTPException 발생 확인
        with pytest.raises(HTTPException) as exc_info:
            self.service.create_trouble(self.test_dto, self.created_by)
        
        assert exc_info.value.status_code == 403
        assert "프로젝트에 접근 권한이 없습니다" in exc_info.value.detail
    
    @patch('app.services.trouble.trouble_repo.save_trouble_logs')
    @patch('app.services.trouble.trouble_repo.create_trouble')
    @patch('app.services.trouble.trouble_repo.check_user_project_access')
    @patch('app.services.trouble.get_logs_by_ids')
    @patch('app.services.trouble.get_project_by_id')
    def test_create_trouble_ai_failure_fallback(
        self,
        mock_get_project,
        mock_get_logs,
        mock_check_access,
        mock_create_trouble,
        mock_save_logs
    ):
        """AI 분석 실패 시 fallback 처리 테스트"""
        
        # Mock 설정
        mock_project = Mock()
        mock_project.id = 1
        mock_get_project.return_value = mock_project
        mock_check_access.return_value = True
        
        # 로그 조회는 실패하도록 설정
        mock_get_logs.side_effect = Exception("Elasticsearch 연결 실패")
        
        mock_trouble = Mock(spec=Trouble)
        mock_trouble.id = 1
        mock_create_trouble.return_value = mock_trouble
        
        # 테스트 실행
        result = self.service.create_trouble(self.test_dto, self.created_by)
        
        # 결과 검증 - fallback 내용으로 생성되었는지 확인
        assert result == mock_trouble
        
        # create_trouble 호출 인수 확인
        call_args = mock_create_trouble.call_args[0][1]  # trouble_data
        assert "사용자 질의에 대한 분석을 진행 중입니다" in call_args["content"]


def test_create_trouble_manual():
    """수동 테스트용 함수 - 실제 의존성과 함께 테스트"""
    print("=== create_trouble 수동 테스트 ===")
    
    # 테스트 데이터
    test_dto = TroubleCreate(
        project_id=1,
        report_name="수동 테스트 리포트",
        is_shared=False,
        user_query="수동 테스트 중입니다. 로그 분석을 부탁드립니다.",
        related_logs=["test_log_1", "test_log_2"]
    )
    
    print(f"입력 데이터: {test_dto.model_dump()}")
    print(f"생성자 ID: 999")
    
    # 실제 서비스 호출은 주석 처리 (의존성 문제로)
    # try:
    #     from app.infra.database.session import get_db
    #     db = next(get_db())
    #     service = TroubleService(db)
    #     result = service.create_trouble(test_dto, 999)
    #     print(f"성공! 생성된 trouble ID: {result.id}")
    # except Exception as e:
    #     print(f"에러 발생: {e}")
    
    print("실제 테스트를 위해서는 DB 연결과 의존성이 필요합니다.")


if __name__ == "__main__":
    # 수동 테스트 실행
    test_create_trouble_manual()
    
    # 단위 테스트 실행
    print("\n=== 단위 테스트 실행 ===")
    pytest.main([__file__, "-v"]) 