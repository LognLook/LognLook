import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_delete_trouble_api():
    """DELETE /api/troubles/{trouble_id} API 테스트"""
    
    print("=== DELETE trouble API 테스트 시작 ===")
    
    # 존재하지 않는 trouble 삭제 시도
    trouble_id = 999
    print(f"\n1. 존재하지 않는 trouble 삭제 시도 (ID: {trouble_id})")
    
    response = client.delete(
        f"/api/troubles/{trouble_id}",
        headers={"Authorization": "Bearer test-token"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # 404 Not Found 예상
    if response.status_code == 404:
        print("✅ 존재하지 않는 trouble에 대해 올바르게 404 반환")
    else:
        print(f"❌ 예상과 다른 응답: {response.status_code}")
    
    # 실제 존재하는 trouble로 테스트 (ID=1 가정)
    print(f"\n2. 실제 trouble 삭제 시도 (ID: 1)")
    
    response = client.delete(
        "/api/troubles/1",
        headers={"Authorization": "Bearer test-token"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # 200 성공 또는 404(존재하지 않음) 또는 403(권한 없음) 중 하나 예상
    if response.status_code in [200, 404, 403]:
        print("✅ 올바른 응답 코드 반환")
    else:
        print(f"❌ 예상과 다른 응답: {response.status_code}")


if __name__ == "__main__":
    test_delete_trouble_api() 