from unittest.mock import Mock, patch
from fastapi import HTTPException
import pytest
from sqlalchemy.orm import Session

from app.services.trouble import TroubleService
from app.models.trouble import Trouble


class TestGetTroubleById:
    """get_trouble_by_id 메서드 테스트 클래스"""
    
    def setup_method(self):
        """각 테스트 실행 전 설정"""
        self.mock_db = Mock(spec=Session)
        self.service = TroubleService(self.mock_db)
        
        # 테스트용 trouble 객체
        self.test_trouble = Mock(spec=Trouble)
        self.test_trouble.id = 1
        self.test_trouble.created_by = 100
        self.test_trouble.is_shared = False
        self.test_trouble.report_name = "테스트 리포트"
        
        self.trouble_id = 1
        self.creator_user_id = 100
        self.other_user_id = 200
    
    @patch('app.services.trouble.trouble_repo.get_trouble_by_id')
    def test_get_trouble_success_creator(self, mock_get_trouble):
        """생성자가 trouble을 조회하는 성공 케이스"""
        
        # Mock 설정
        mock_get_trouble.return_value = self.test_trouble
        
        # 테스트 실행
        result = self.service.get_trouble_by_id(self.trouble_id, self.creator_user_id)
        
        # 결과 검증
        assert result == self.test_trouble
        mock_get_trouble.assert_called_once_with(self.mock_db, self.trouble_id)
    
    @patch('app.services.trouble.trouble_repo.get_trouble_by_id')
    def test_get_trouble_success_shared(self, mock_get_trouble):
        """공유된 trouble을 다른 사용자가 조회하는 성공 케이스"""
        
        # 공유된 trouble로 설정
        self.test_trouble.is_shared = True
        mock_get_trouble.return_value = self.test_trouble
        
        # 테스트 실행 (다른 사용자가 조회)
        result = self.service.get_trouble_by_id(self.trouble_id, self.other_user_id)
        
        # 결과 검증
        assert result == self.test_trouble
        mock_get_trouble.assert_called_once_with(self.mock_db, self.trouble_id)
    
    @patch('app.services.trouble.trouble_repo.get_trouble_by_id')
    def test_get_trouble_not_found(self, mock_get_trouble):
        """존재하지 않는 trouble 조회 시 404 에러"""
        
        # trouble이 None 반환
        mock_get_trouble.return_value = None
        
        # HTTPException 발생 확인
        with pytest.raises(HTTPException) as exc_info:
            self.service.get_trouble_by_id(self.trouble_id, self.creator_user_id)
        
        assert exc_info.value.status_code == 404
        assert "요청한 trouble을 찾을 수 없습니다" in exc_info.value.detail
    
    @patch('app.services.trouble.trouble_repo.get_trouble_by_id')
    def test_get_trouble_permission_denied(self, mock_get_trouble):
        """권한이 없는 사용자가 비공유 trouble 조회 시 403 에러"""
        
        # 비공유 trouble로 설정
        self.test_trouble.is_shared = False
        mock_get_trouble.return_value = self.test_trouble
        
        # HTTPException 발생 확인 (다른 사용자가 비공유 trouble 조회)
        with pytest.raises(HTTPException) as exc_info:
            self.service.get_trouble_by_id(self.trouble_id, self.other_user_id)
        
        assert exc_info.value.status_code == 403
        assert "이 trouble에 접근할 권한이 없습니다" in exc_info.value.detail


def test_check_trouble_access():
    """_check_trouble_access 메서드 개별 테스트"""
    
    mock_db = Mock(spec=Session)
    service = TroubleService(mock_db)
    
    # 테스트용 trouble 객체들
    creator_trouble = Mock(spec=Trouble)
    creator_trouble.created_by = 100
    creator_trouble.is_shared = False
    
    shared_trouble = Mock(spec=Trouble) 
    shared_trouble.created_by = 100
    shared_trouble.is_shared = True
    
    private_trouble = Mock(spec=Trouble)
    private_trouble.created_by = 100
    private_trouble.is_shared = False
    
    # 테스트 케이스들
    assert service._check_trouble_access(creator_trouble, 100) == True    # 생성자 접근
    assert service._check_trouble_access(shared_trouble, 200) == True     # 공유된 trouble 접근
    assert service._check_trouble_access(private_trouble, 200) == False   # 권한 없는 접근


def test_get_trouble_manual():
    """수동 테스트용 함수"""
    print("=== get_trouble_by_id 수동 테스트 ===")
    print(f"trouble_id: 1")
    print(f"user_id: 1 (생성자)")
    print("실제 테스트를 위해서는 DB 연결과 의존성이 필요합니다.")


if __name__ == "__main__":
    # 수동 테스트 실행
    test_get_trouble_manual()
    
    # 단위 테스트 실행
    print("\n=== get_trouble_by_id 단위 테스트 실행 ===")
    import pytest
    pytest.main([__file__, "-v"]) 