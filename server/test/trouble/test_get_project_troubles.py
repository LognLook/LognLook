from unittest.mock import Mock, patch
from fastapi import HTTPException
import pytest
from sqlalchemy.orm import Session
from datetime import datetime

from app.services.trouble import TroubleService
from app.models.trouble import Trouble
from app.models.project import Project
from app.schemas.trouble import TroubleListQuery, TroubleListResponse, TroubleSummary


class TestGetProjectTroubles:
    """get_project_troubles 메서드 테스트 클래스"""
    
    def setup_method(self):
        """각 테스트 실행 전 설정"""
        self.mock_db = Mock(spec=Session)
        self.service = TroubleService(self.mock_db)
        
        # 테스트용 프로젝트 객체
        self.test_project = Mock(spec=Project)
        self.test_project.id = 1
        self.test_project.name = "테스트 프로젝트"
        
        # 테스트용 trouble 객체들
        self.test_troubles = [
            Mock(spec=Trouble,
                id=1,
                report_name="로그인 오류 분석",
                created_at=datetime(2024, 1, 1, 10, 0, 0),
                is_shared=True,
                trouble_logs=[Mock(), Mock()]  # 2개 로그
            ),
            Mock(spec=Trouble,
                id=2,
                report_name="API 응답 지연",
                created_at=datetime(2024, 1, 2, 11, 0, 0),
                is_shared=False,
                trouble_logs=[Mock()]  # 1개 로그
            )
        ]
        
        self.project_id = 1
        self.user_id = 100
        self.other_user_id = 200
    
    @patch('app.services.trouble.trouble_repo.get_creator_email')
    @patch('app.services.trouble.trouble_repo.get_project_troubles_paginated')
    @patch('app.services.trouble.get_project_by_id')
    def test_get_project_troubles_success(
        self, 
        mock_get_project, 
        mock_get_troubles, 
        mock_get_creator_email
    ):
        """프로젝트 trouble 목록 조회 성공 케이스"""
        
        # Mock 설정
        mock_get_project.return_value = self.test_project
        mock_get_troubles.return_value = (self.test_troubles, 2)  # troubles, total
        mock_get_creator_email.side_effect = ["user1@example.com", "user2@example.com"]
        
        # 쿼리 파라미터
        query_params = TroubleListQuery(page=1, size=10)
        
        # 테스트 실행
        result = self.service.get_project_troubles(
            self.project_id, 
            query_params, 
            self.user_id
        )
        
        # 검증
        assert isinstance(result, TroubleListResponse)
        assert len(result.items) == 2
        assert result.total == 2
        assert result.page == 1
        assert result.size == 10
        assert result.pages == 1  # (2 + 10 - 1) // 10 = 1
        
        # 첫 번째 아이템 검증
        first_item = result.items[0]
        assert first_item.id == 1
        assert first_item.report_name == "로그인 오류 분석"
        assert first_item.is_shared == True
        assert first_item.creator_email == "user1@example.com"
        assert first_item.logs_count == 2
        
        # Mock 호출 검증
        mock_get_project.assert_called_once_with(self.mock_db, self.project_id)
        mock_get_troubles.assert_called_once_with(self.mock_db, self.project_id, query_params, self.user_id)
    
    @patch('app.services.trouble.get_project_by_id')
    def test_get_project_troubles_project_not_found(self, mock_get_project):
        """존재하지 않는 프로젝트로 조회 시 404 에러"""
        
        # 프로젝트가 None 반환
        mock_get_project.return_value = None
        
        query_params = TroubleListQuery(page=1, size=10)
        
        # HTTPException 발생 확인
        with pytest.raises(HTTPException) as exc_info:
            self.service.get_project_troubles(self.project_id, query_params, self.user_id)
        
        assert exc_info.value.status_code == 404
        assert "프로젝트를 찾을 수 없습니다" in exc_info.value.detail
    
    @patch('app.services.trouble.trouble_repo.get_creator_email')
    @patch('app.services.trouble.trouble_repo.get_project_troubles_paginated')
    @patch('app.services.trouble.get_project_by_id')
    def test_get_project_troubles_pagination(
        self, 
        mock_get_project, 
        mock_get_troubles, 
        mock_get_creator_email
    ):
        """페이지네이션 계산 테스트"""
        
        # Mock 설정 - 총 25개 아이템
        mock_get_project.return_value = self.test_project
        mock_get_troubles.return_value = (self.test_troubles, 25)  # total = 25
        mock_get_creator_email.return_value = "user@example.com"
        
        # 페이지 크기 10으로 설정
        query_params = TroubleListQuery(page=2, size=10)
        
        # 테스트 실행
        result = self.service.get_project_troubles(
            self.project_id, 
            query_params, 
            self.user_id
        )
        
        # 페이지네이션 검증
        assert result.total == 25
        assert result.page == 2
        assert result.size == 10
        assert result.pages == 3  # (25 + 10 - 1) // 10 = 3
    
    @patch('app.services.trouble.trouble_repo.get_creator_email')
    @patch('app.services.trouble.trouble_repo.get_project_troubles_paginated')
    @patch('app.services.trouble.get_project_by_id')
    def test_get_project_troubles_with_search(
        self, 
        mock_get_project, 
        mock_get_troubles, 
        mock_get_creator_email
    ):
        """검색 필터와 함께 조회하는 케이스"""
        
        # Mock 설정
        mock_get_project.return_value = self.test_project
        mock_get_troubles.return_value = ([self.test_troubles[0]], 1)  # 검색 결과 1개
        mock_get_creator_email.return_value = "user@example.com"
        
        # 검색어가 포함된 쿼리 파라미터
        query_params = TroubleListQuery(
            page=1, 
            size=10, 
            search="로그인",
            is_shared=True
        )
        
        # 테스트 실행
        result = self.service.get_project_troubles(
            self.project_id, 
            query_params, 
            self.user_id
        )
        
        # 검증
        assert len(result.items) == 1
        assert result.total == 1
        assert result.items[0].report_name == "로그인 오류 분석"
        
        # 쿼리 파라미터가 repository에 전달되었는지 확인
        mock_get_troubles.assert_called_once_with(
            self.mock_db, 
            self.project_id, 
            query_params, 
            self.user_id
        )
    
    @patch('app.services.trouble.trouble_repo.get_creator_email')
    @patch('app.services.trouble.trouble_repo.get_project_troubles_paginated')
    @patch('app.services.trouble.get_project_by_id')
    def test_get_project_troubles_empty_result(
        self, 
        mock_get_project, 
        mock_get_troubles, 
        mock_get_creator_email
    ):
        """빈 결과 처리 테스트"""
        
        # Mock 설정 - 빈 결과
        mock_get_project.return_value = self.test_project
        mock_get_troubles.return_value = ([], 0)  # 빈 결과
        
        query_params = TroubleListQuery(page=1, size=10)
        
        # 테스트 실행
        result = self.service.get_project_troubles(
            self.project_id, 
            query_params, 
            self.user_id
        )
        
        # 검증
        assert len(result.items) == 0
        assert result.total == 0
        assert result.page == 1
        assert result.size == 10
        assert result.pages == 0  # (0 + 10 - 1) // 10 = 0
    
    @patch('app.services.trouble.trouble_repo.get_creator_email')
    @patch('app.services.trouble.trouble_repo.get_project_troubles_paginated')
    @patch('app.services.trouble.get_project_by_id')
    def test_get_project_troubles_without_trouble_logs(
        self, 
        mock_get_project, 
        mock_get_troubles, 
        mock_get_creator_email
    ):
        """trouble_logs 속성이 없는 trouble 처리 테스트"""
        
        # trouble_logs 속성이 없는 Mock 객체
        trouble_without_logs = Mock(spec=Trouble)
        trouble_without_logs.id = 3
        trouble_without_logs.report_name = "로그 없는 trouble"
        trouble_without_logs.created_at = datetime(2024, 1, 3, 12, 0, 0)
        trouble_without_logs.is_shared = False
        # hasattr(trouble, 'trouble_logs') == False
        
        # Mock 설정
        mock_get_project.return_value = self.test_project
        mock_get_troubles.return_value = ([trouble_without_logs], 1)
        mock_get_creator_email.return_value = "user@example.com"
        
        query_params = TroubleListQuery(page=1, size=10)
        
        # 테스트 실행
        result = self.service.get_project_troubles(
            self.project_id, 
            query_params, 
            self.user_id
        )
        
        # 검증 - logs_count가 0으로 처리되는지 확인
        assert len(result.items) == 1
        assert result.items[0].logs_count == 0


def test_get_project_troubles_manual():
    """수동 테스트용 함수"""
    print("=== get_project_troubles 수동 테스트 ===")
    print(f"project_id: 1")
    print(f"user_id: 1 (프로젝트 멤버)")
    print("query_params: page=1, size=10, search='로그인'")
    print("예상 결과: 성공적으로 목록 조회")
    print()
    print(f"project_id: 999 (존재하지 않음)")
    print("예상 결과: 404 Not Found")
    print()
    print(f"project_id: 1, user_id: 999 (비멤버)")
    print("예상 결과: 403 Forbidden")
    print()
    print("실제 테스트를 위해서는 DB 연결과 의존성이 필요합니다.")


if __name__ == "__main__":
    # 수동 테스트 실행
    test_get_project_troubles_manual()
    
    # 단위 테스트 실행
    print("\n=== get_project_troubles 단위 테스트 실행 ===")
    import pytest
    pytest.main([__file__, "-v"]) 