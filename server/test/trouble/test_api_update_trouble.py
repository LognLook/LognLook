import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_update_trouble_api():
    """PUT /api/troubles/{trouble_id} API 테스트"""
    
    print("=== UPDATE trouble API 테스트 시작 ===")
    
    # 1. 필수 필드 누락 테스트
    print("\n1. 필수 필드 누락 테스트 (content 없음)")
    invalid_data = {
        "report_name": "수정된 리포트",
        "is_shared": True
        # content 필드 누락
    }
    
    response = client.put(
        "/api/troubles/1",
        json=invalid_data,
        headers={"Authorization": "Bearer test-token"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 422:
        print("✅ 필수 필드 누락 시 올바르게 422 반환")
    else:
        print(f"❌ 예상과 다른 응답: {response.status_code}")
    
    # 2. 존재하지 않는 trouble 수정 시도
    print("\n2. 존재하지 않는 trouble 수정 테스트")
    valid_data = {
        "content": "수정된 분석 내용입니다",
        "report_name": "새로운 리포트명",
        "is_shared": True
    }
    
    response = client.put(
        "/api/troubles/999",  # 존재하지 않는 ID
        json=valid_data,
        headers={"Authorization": "Bearer test-token"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 404:
        print("✅ 존재하지 않는 trouble에 대해 올바르게 404 반환")
    else:
        print(f"❌ 예상과 다른 응답: {response.status_code}")
    
    # 3. 유효한 데이터로 trouble 수정 테스트
    print("\n3. 유효한 데이터로 trouble 수정 테스트")
    
    response = client.put(
        "/api/troubles/1",  # 실제 존재하는 trouble ID
        json=valid_data,
        headers={"Authorization": "Bearer test-token"}
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    if response.status_code == 200:
        print("✅ 유효한 데이터로 trouble 수정 성공")
        data = response.json()
        if "id" in data and "content" in data:
            print(f"✅ 응답에 필수 필드들 포함됨")
            print(f"   - ID: {data.get('id')}")
            print(f"   - Content: {data.get('content')[:50]}...")
            print(f"   - Is Shared: {data.get('is_shared')}")
        else:
            print("❌ 응답에 필수 필드 누락")
    elif response.status_code == 404:
        print("⚠️  트러블슈팅을 찾을 수 없음 (테스트 데이터 없음)")
    elif response.status_code == 403:
        print("⚠️  수정 권한 없음 (생성자가 아님)")
    else:
        print(f"❌ 예상과 다른 응답: {response.status_code}")

def test_update_trouble_validation():
    """update trouble 유효성 검증 테스트"""
    
    print("\n=== UPDATE trouble 유효성 검증 테스트 ===")
    
    # 1. content만 수정
    print("\n1. content만 수정하는 테스트")
    data = {
        "content": "새로운 분석 결과입니다. 로그 분석 결과 API 응답 시간이 평소보다 3배 느려진 것을 확인했습니다."
    }
    
    response = client.put("/api/troubles/1", json=data, headers={"Authorization": "Bearer test-token"})
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
    
    # 2. 공유 설정만 변경
    print("\n2. 공유 설정만 변경하는 테스트")
    data = {
        "content": "기존 내용 유지",
        "is_shared": True
    }
    
    response = client.put("/api/troubles/1", json=data, headers={"Authorization": "Bearer test-token"})
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")


if __name__ == "__main__":
    test_update_trouble_api()
    test_update_trouble_validation() 