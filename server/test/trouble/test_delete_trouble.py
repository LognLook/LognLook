from unittest.mock import Mock, patch
from fastapi import HTTPException
import pytest
from sqlalchemy.orm import Session

from app.services.trouble import TroubleService
from app.models.trouble import Trouble


class TestDeleteTrouble:
    """delete_trouble 메서드 테스트 클래스"""
    
    def setup_method(self):
        """각 테스트 실행 전 설정"""
        self.mock_db = Mock(spec=Session)
        self.service = TroubleService(self.mock_db)
        
        # 테스트용 trouble 객체
        self.test_trouble = Mock(spec=Trouble)
        self.test_trouble.id = 1
        self.test_trouble.created_by = 100
        self.test_trouble.report_name = "테스트 리포트"
        
        self.trouble_id = 1
        self.creator_user_id = 100
        self.other_user_id = 200
    
    @patch('app.services.trouble.trouble_repo.delete_trouble')
    @patch('app.services.trouble.trouble_repo.get_trouble_by_id')
    def test_delete_trouble_success(self, mock_get_trouble, mock_delete_trouble):
        """생성자가 trouble을 삭제하는 성공 케이스"""
        
        # Mock 설정
        mock_get_trouble.return_value = self.test_trouble
        mock_delete_trouble.return_value = None
        
        # 테스트 실행 (예외가 발생하지 않아야 함)
        self.service.delete_trouble(self.trouble_id, self.creator_user_id)
        
        # 호출 검증
        mock_get_trouble.assert_called_once_with(self.mock_db, self.trouble_id)
        mock_delete_trouble.assert_called_once_with(self.mock_db, self.test_trouble)
    
    @patch('app.services.trouble.trouble_repo.get_trouble_by_id')
    def test_delete_trouble_not_found(self, mock_get_trouble):
        """존재하지 않는 trouble 삭제 시 404 에러"""
        
        # trouble이 None 반환
        mock_get_trouble.return_value = None
        
        # HTTPException 발생 확인
        with pytest.raises(HTTPException) as exc_info:
            self.service.delete_trouble(self.trouble_id, self.creator_user_id)
        
        assert exc_info.value.status_code == 404
        assert "요청한 trouble을 찾을 수 없습니다" in exc_info.value.detail
    
    @patch('app.services.trouble.trouble_repo.get_trouble_by_id')
    def test_delete_trouble_permission_denied(self, mock_get_trouble):
        """생성자가 아닌 사용자가 trouble 삭제 시 403 에러"""
        
        # Mock 설정
        mock_get_trouble.return_value = self.test_trouble
        
        # HTTPException 발생 확인 (다른 사용자가 삭제 시도)
        with pytest.raises(HTTPException) as exc_info:
            self.service.delete_trouble(self.trouble_id, self.other_user_id)
        
        assert exc_info.value.status_code == 403
        assert "이 trouble을 삭제할 권한이 없습니다" in exc_info.value.detail
        assert "생성자만 삭제할 수 있습니다" in exc_info.value.detail
    
    @patch('app.services.trouble.trouble_repo.delete_trouble')
    @patch('app.services.trouble.trouble_repo.get_trouble_by_id')
    def test_delete_trouble_database_error(self, mock_get_trouble, mock_delete_trouble):
        """데이터베이스 삭제 중 에러 발생 시 예외 전파"""
        
        # Mock 설정
        mock_get_trouble.return_value = self.test_trouble
        mock_delete_trouble.side_effect = Exception("Database connection error")
        
        # Exception 발생 확인
        with pytest.raises(Exception) as exc_info:
            self.service.delete_trouble(self.trouble_id, self.creator_user_id)
        
        assert "Database connection error" in str(exc_info.value)


def test_delete_trouble_manual():
    """수동 테스트용 함수"""
    print("=== delete_trouble 수동 테스트 ===")
    print(f"trouble_id: 1")
    print(f"user_id: 1 (생성자)")
    print("예상 결과: 성공적으로 삭제")
    print()
    print(f"trouble_id: 1")
    print(f"user_id: 2 (다른 사용자)")
    print("예상 결과: 403 Forbidden (권한 없음)")
    print()
    print("실제 테스트를 위해서는 DB 연결과 의존성이 필요합니다.")


if __name__ == "__main__":
    # 수동 테스트 실행
    test_delete_trouble_manual()
    
    # 단위 테스트 실행
    print("\n=== delete_trouble 단위 테스트 실행 ===")
    import pytest
    pytest.main([__file__, "-v"]) 