import requests
import json
from typing import Dict, Any


class TroubleAPITest:
    """Trouble API 테스트 클래스"""
    
    def __init__(self, base_url: str = "http://localhost:8000"):
        self.base_url = base_url
        self.headers = {
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    def test_create_trouble(self) -> Dict[str, Any]:
        """create_trouble API 테스트"""
        
        # 테스트 데이터
        test_data = {
            "project_id": 1,
            "report_name": "API 테스트 리포트",
            "is_shared": False,
            "user_query": "API 테스트 중입니다. 로그인 문제를 분석해주세요.",
            "related_logs": ["api_test_log_1", "api_test_log_2"]
        }
        
        print("=== Trouble 생성 API 테스트 ===")
        print(f"요청 URL: {self.base_url}/api/troubles")
        print(f"요청 데이터: {json.dumps(test_data, indent=2, ensure_ascii=False)}")
        
        try:
            response = requests.post(
                f"{self.base_url}/api/troubles",
                json=test_data,
                headers=self.headers,
                timeout=30
            )
            
            print(f"응답 상태 코드: {response.status_code}")
            print(f"응답 헤더: {dict(response.headers)}")
            
            if response.status_code == 200:
                result = response.json()
                print(f"성공! 응답 데이터:")
                print(json.dumps(result, indent=2, ensure_ascii=False))
                return result
            else:
                print(f"에러 응답:")
                print(response.text)
                return {"error": response.text, "status_code": response.status_code}
                
        except requests.exceptions.ConnectionError:
            print("❌ 서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.")
            return {"error": "Connection failed"}
        except requests.exceptions.Timeout:
            print("❌ 요청 시간이 초과되었습니다.")
            return {"error": "Timeout"}
        except Exception as e:
            print(f"❌ 예상치 못한 에러 발생: {e}")
            return {"error": str(e)}
    
    def test_multiple_scenarios(self):
        """여러 시나리오 테스트"""
        
        scenarios = [
            {
                "name": "정상 케이스",
                "data": {
                    "project_id": 1,
                    "report_name": "정상 테스트",
                    "is_shared": False,
                    "user_query": "정상적인 trouble 생성 테스트입니다.",
                    "related_logs": ["log1", "log2"]
                }
            },
            {
                "name": "공유 활성화 케이스",
                "data": {
                    "project_id": 1,
                    "report_name": "공유 테스트",
                    "is_shared": True,
                    "user_query": "공유된 trouble 생성 테스트입니다.",
                    "related_logs": ["log3", "log4"]
                }
            },
            {
                "name": "긴 사용자 질의 케이스",
                "data": {
                    "project_id": 1,
                    "report_name": "긴 질의 테스트",
                    "is_shared": False,
                    "user_query": "이것은 매우 긴 사용자 질의입니다. " * 10,
                    "related_logs": ["log5"]
                }
            },
            {
                "name": "잘못된 프로젝트 ID",
                "data": {
                    "project_id": 99999,
                    "report_name": "존재하지 않는 프로젝트",
                    "is_shared": False,
                    "user_query": "존재하지 않는 프로젝트 테스트",
                    "related_logs": ["log6"]
                }
            }
        ]
        
        print("\n=== 다양한 시나리오 테스트 ===")
        
        for i, scenario in enumerate(scenarios, 1):
            print(f"\n{i}. {scenario['name']}")
            print("-" * 50)
            
            try:
                response = requests.post(
                    f"{self.base_url}/api/troubles",
                    json=scenario["data"],
                    headers=self.headers,
                    timeout=10
                )
                
                print(f"상태 코드: {response.status_code}")
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"✅ 성공 - ID: {result.get('id', 'N/A')}")
                else:
                    print(f"❌ 실패 - {response.text}")
                    
            except Exception as e:
                print(f"❌ 에러: {e}")


def test_with_curl_command():
    """curl 명령어 생성"""
    
    test_data = {
        "project_id": 1,
        "report_name": "curl 테스트",
        "is_shared": False,
        "user_query": "curl로 trouble 생성 테스트",
        "related_logs": ["curl_log_1"]
    }
    
    curl_command = f"""
curl -X POST "http://localhost:8000/api/troubles" \\
     -H "Content-Type: application/json" \\
     -H "Accept: application/json" \\
     -d '{json.dumps(test_data, ensure_ascii=False)}'
    """.strip()
    
    print("=== curl 명령어로 테스트 ===")
    print(curl_command)
    return curl_command


if __name__ == "__main__":
    print("🚀 Trouble API 테스트 시작")
    
    # API 테스트 실행
    tester = TroubleAPITest()
    
    # 1. 기본 테스트
    result = tester.test_create_trouble()
    
    # 2. 다양한 시나리오 테스트 (서버가 실행 중인 경우)
    if "error" not in result or result.get("status_code") != "Connection failed":
        tester.test_multiple_scenarios()
    
    # 3. curl 명령어 출력
    print("\n" + "="*60)
    test_with_curl_command()
    
    print("\n✨ 테스트 완료!")
    print("\n📝 서버 실행 방법:")
    print("   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000") 