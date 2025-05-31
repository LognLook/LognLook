from unittest.mock import Mock, patch
from fastapi import HTTPException
import pytest
from sqlalchemy.orm import Session

from app.services.trouble import TroubleService
from app.models.trouble import Trouble
from app.schemas.trouble import TroubleUpdate


class TestUpdateTrouble:
    """update_trouble 메서드 테스트 클래스"""
    
    def setup_method(self):
        """각 테스트 실행 전 설정"""
        self.mock_db = Mock(spec=Session)
        self.service = TroubleService(self.mock_db)
        
        # 테스트용 trouble 객체
        self.test_trouble = Mock(spec=Trouble)
        self.test_trouble.id = 1
        self.test_trouble.created_by = 100
        self.test_trouble.report_name = "기존 리포트"
        self.test_trouble.content = "기존 내용"
        self.test_trouble.is_shared = False
        
        # 업데이트된 trouble 객체
        self.updated_trouble = Mock(spec=Trouble)
        self.updated_trouble.id = 1
        self.updated_trouble.created_by = 100
        self.updated_trouble.report_name = "수정된 리포트"
        self.updated_trouble.content = "수정된 내용"
        self.updated_trouble.is_shared = True
        
        self.trouble_id = 1
        self.creator_user_id = 100
        self.other_user_id = 200
    
    @patch('app.services.trouble.trouble_repo.update_trouble')
    @patch('app.services.trouble.trouble_repo.get_trouble_by_id')
    def test_update_trouble_success(self, mock_get_trouble, mock_update_trouble):
        """생성자가 trouble을 수정하는 성공 케이스"""
        
        # Mock 설정
        mock_get_trouble.return_value = self.test_trouble
        mock_update_trouble.return_value = self.updated_trouble
        
        # 업데이트 데이터
        update_data = TroubleUpdate(
            report_name="수정된 리포트",
            content="수정된 내용",
            is_shared=True
        )
        
        # 테스트 실행
        result = self.service.update_trouble(
            self.trouble_id, 
            update_data, 
            self.creator_user_id
        )
        
        # 검증
        assert result == self.updated_trouble
        mock_get_trouble.assert_called_once_with(self.mock_db, self.trouble_id)
        mock_update_trouble.assert_called_once_with(
            self.mock_db, 
            self.test_trouble, 
            update_data
        )
    
    @patch('app.services.trouble.trouble_repo.get_trouble_by_id')
    def test_update_trouble_not_found(self, mock_get_trouble):
        """존재하지 않는 trouble 수정 시 404 에러"""
        
        # trouble이 None 반환
        mock_get_trouble.return_value = None
        
        update_data = TroubleUpdate(
            content="수정된 내용"
        )
        
        # HTTPException 발생 확인
        with pytest.raises(HTTPException) as exc_info:
            self.service.update_trouble(self.trouble_id, update_data, self.creator_user_id)
        
        assert exc_info.value.status_code == 404
        assert "요청한 트러블슈팅을 찾을 수 없습니다" in exc_info.value.detail
    
    @patch('app.services.trouble.trouble_repo.get_trouble_by_id')
    def test_update_trouble_permission_denied(self, mock_get_trouble):
        """생성자가 아닌 사용자가 trouble 수정 시 403 에러"""
        
        # Mock 설정
        mock_get_trouble.return_value = self.test_trouble
        
        update_data = TroubleUpdate(
            content="수정된 내용"
        )
        
        # HTTPException 발생 확인 (다른 사용자가 수정 시도)
        with pytest.raises(HTTPException) as exc_info:
            self.service.update_trouble(self.trouble_id, update_data, self.other_user_id)
        
        assert exc_info.value.status_code == 403
        assert "이 트러블슈팅을 수정할 권한이 없습니다" in exc_info.value.detail
        assert "생성자만 수정할 수 있습니다" in exc_info.value.detail
    
    @patch('app.services.trouble.trouble_repo.update_trouble')
    @patch('app.services.trouble.trouble_repo.get_trouble_by_id')
    def test_update_trouble_content_only(self, mock_get_trouble, mock_update_trouble):
        """content만 업데이트하는 케이스"""
        
        # Mock 설정
        mock_get_trouble.return_value = self.test_trouble
        mock_update_trouble.return_value = self.updated_trouble
        
        # content만 업데이트
        update_data = TroubleUpdate(
            content="새로운 분석 내용입니다"
        )
        
        # 테스트 실행
        result = self.service.update_trouble(
            self.trouble_id, 
            update_data, 
            self.creator_user_id
        )
        
        # 검증
        assert result == self.updated_trouble
        mock_update_trouble.assert_called_once_with(
            self.mock_db, 
            self.test_trouble, 
            update_data
        )
    
    @patch('app.services.trouble.trouble_repo.update_trouble')
    @patch('app.services.trouble.trouble_repo.get_trouble_by_id')
    def test_update_trouble_sharing_toggle(self, mock_get_trouble, mock_update_trouble):
        """공유 설정만 토글하는 케이스"""
        
        # Mock 설정
        mock_get_trouble.return_value = self.test_trouble
        mock_update_trouble.return_value = self.updated_trouble
        
        # 공유 설정만 변경
        update_data = TroubleUpdate(
            content="기존 내용 유지",
            is_shared=True  # False에서 True로 변경
        )
        
        # 테스트 실행
        result = self.service.update_trouble(
            self.trouble_id, 
            update_data, 
            self.creator_user_id
        )
        
        # 검증
        assert result == self.updated_trouble
        mock_update_trouble.assert_called_once()
    
    @patch('app.services.trouble.trouble_repo.update_trouble')
    @patch('app.services.trouble.trouble_repo.get_trouble_by_id')
    def test_update_trouble_database_error(self, mock_get_trouble, mock_update_trouble):
        """데이터베이스 업데이트 중 에러 발생 시 예외 전파"""
        
        # Mock 설정
        mock_get_trouble.return_value = self.test_trouble
        mock_update_trouble.side_effect = Exception("Database update error")
        
        update_data = TroubleUpdate(
            content="수정된 내용"
        )
        
        # Exception 발생 확인
        with pytest.raises(Exception) as exc_info:
            self.service.update_trouble(self.trouble_id, update_data, self.creator_user_id)
        
        assert "Database update error" in str(exc_info.value)


def test_update_trouble_manual():
    """수동 테스트용 함수"""
    print("=== update_trouble 수동 테스트 ===")
    print(f"trouble_id: 1")
    print(f"user_id: 1 (생성자)")
    print("update_data: content='새로운 분석 내용', is_shared=True")
    print("예상 결과: 성공적으로 업데이트")
    print()
    print(f"trouble_id: 1")
    print(f"user_id: 2 (다른 사용자)")
    print("예상 결과: 403 Forbidden (권한 없음)")
    print()
    print("실제 테스트를 위해서는 DB 연결과 의존성이 필요합니다.")


if __name__ == "__main__":
    # 수동 테스트 실행
    test_update_trouble_manual()
    
    # 단위 테스트 실행
    print("\n=== update_trouble 단위 테스트 실행 ===")
    import pytest
    pytest.main([__file__, "-v"]) 