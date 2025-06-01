from unittest.mock import Mock, patch
from fastapi import HTTPException
import pytest
from sqlalchemy.orm import Session
from app.services.log import LogService

class TestGetLogDetail:
    """get_log_detail 메서드 테스트 클래스"""

    def setup_method(self):
        """각 테스트 실행 전 설정"""
        self.mock_db = Mock(spec=Session)
        self.service = LogService(self.mock_db)

        # 테스트용 데이터
        self.test_project_id = 1
        self.test_log_ids = [1, 2, 3]

        # 테스트용 로그 데이터
        self.test_log_data = {
            "message": "테스트 로그 메시지",
            "timestamp": "2024-03-20 10:00:00",
            "log_level": "INFO",
        }

    @patch("app.services.log.ElasticsearchRepository.get_logs_by_id")
    @patch("app.services.log.ProjectService.get_project_by_id")
    def test_get_log_detail_success(self, mock_get_project, mock_get_logs):
        """로그 상세 조회 성공 테스트"""
        # Mock 설정
        mock_project = Mock()
        mock_project.index = "test-index"
        mock_get_project.return_value = mock_project

        mock_get_logs.return_value = self.test_log_data

        # 테스트 실행
        result = self.service.get_log_detail(self.test_project_id, self.test_log_ids)

        # 결과 검증
        assert result == self.test_log_data
        mock_get_project.assert_called_once_with(self.mock_db, self.test_project_id)
        mock_get_logs.assert_called_once_with(
            index_name=mock_project.index, ids=self.test_log_ids
        )

    @patch("app.services.log.ProjectService.get_project_by_id")
    def test_get_log_detail_project_not_found(self, mock_get_project):
        """프로젝트가 존재하지 않는 경우 테스트"""
        # 프로젝트가 None 반환
        mock_get_project.return_value = None

        # HTTPException 발생 확인
        with pytest.raises(HTTPException) as exc_info:
            self.service.get_log_detail(self.test_project_id, self.test_log_ids)

        assert exc_info.value.status_code == 404
        assert "프로젝트를 찾을 수 없습니다" in exc_info.value.detail

    @patch("app.services.log.ElasticsearchRepository.get_logs_by_id")
    @patch("app.services.log.ProjectService.get_project_by_id")
    def test_get_log_detail_elasticsearch_error(self, mock_get_project, mock_get_logs):
        """Elasticsearch 조회 실패 테스트"""
        # Mock 설정
        mock_project = Mock()
        mock_project.index = "test-index"
        mock_get_project.return_value = mock_project

        # Elasticsearch 에러 발생
        mock_get_logs.side_effect = Exception("Elasticsearch 연결 실패")

        # HTTPException 발생 확인
        with pytest.raises(HTTPException) as exc_info:
            self.service.get_log_detail(self.test_project_id, self.test_log_ids)

        assert exc_info.value.status_code == 500
        assert "로그 조회 중 오류가 발생했습니다" in exc_info.value.detail


def test_get_log_detail_manual():
    """수동 테스트용 함수"""
    print("=== get_log_detail 수동 테스트 ===")
    print(f"프로젝트 ID: 1")
    print(f"로그 ID 목록: [1, 2, 3]")
    print("실제 테스트를 위해서는 DB 연결과 의존성이 필요합니다.")


if __name__ == "__main__":
    # 수동 테스트 실행
    test_get_log_detail_manual()

    # 단위 테스트 실행
    print("\n=== get_log_detail 단위 테스트 실행 ===")
    import pytest

    pytest.main([__file__, "-v"])
