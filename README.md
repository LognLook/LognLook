<h1 align="center">
  <br>
  <img width="120" height="120" alt="logo_20x20" src="https://github.com/user-attachments/assets/c44c71f5-cfba-4623-9dd1-df761dd2dca6" />
</h1>

<h4 align="center">
  1인 개발자를 위한 가볍고 직관적인 AI 기반 로그 분석 솔루션
</h4>

<h4 align="center">
  <a href="https://youtu.be/UxH8B7sVF60?si=D0GpGIvmSOnymddZ" target="_blank">📼 시연 영상</a>
</h4>

<p align="center">
  <a href="#소개">소개</a> •
  <a href="#주요-기능">주요 기능</a> •
  <a href="#기술-스택">기술 스택</a> •
  <a href="#아키텍처">아키텍처</a> •
  <a href="#진행-현황과-향후-계획">진행 현황과 향후 계획</a> •
  <a href="#기여-방법">기여 방법</a>
</p>

<div align="center">

| <img src="https://github.com/JJadeYoon.png" width="100px"/><br/>**윤종석** | <img src="https://github.com/633jinn.png" width="100px"/><br/>**강희진** | <img src="https://github.com/30isdead.png" width="100px"/><br/>**박세영** | <img src="https://github.com/user-attachments/assets/19779c45-69b7-465a-8409-310f1302354b" width="100px"/><br/>**김선정** |
| :---: | :---: | :---: | :---: |
| `BE・DATA` | `BE・Infra` | `FE・UX` | `디자인・UX` |

</div>

</div>


</div>

<br>

## 소개

**LognLook**은 1인 개발자 및 소규모 개발팀을 위해 탄생한 **AI 기반 로그 분석 솔루션**입니다. 복잡하고 비용이 많이 드는 기존 솔루션(ELK Stack, Sentry, Datadog 등)의 한계를 극복하고, 개발자가 로그 분석에 들이는 시간과 노력을 획기적으로 줄여주는 것을 목표로 합니다.

**LognLook**은 AI 기술을 활용하여 로그를 **직관적으로 분석**하고, **자연어 기반의 트러블슈팅** 환경을 제공함으로써 개발자가 문제 해결에 집중할 수 있도록 돕습니다.

### 개발 배경 및 목표

현대의 소프트웨어 개발 환경에서 로그 분석은 서비스 운영과 유지보수에 필수적이지만, 기존 엔터프라이즈급 솔루션은 높은 진입 장벽과 비용 부담으로 1인 개발자나 소규모 팀에게는 비효율적입니다.

**LognLook**은 이러한 문제를 해결하기 위해, 누구나 쉽고 빠르게 로그를 분석하고 문제를 해결할 수 있는 **사용자 친화적인 오픈소스 대안**을 제시합니다. 특히, LLM을 활용한 자연어 로그 설명, 하이브리드 검색(BM25 + 벡터 검색)을 통한 정확한 로그 탐색, 그리고 AI 기반의 통합 트러블슈팅 환경을 제공함으로써 개발자가 단순 키워드 검색을 넘어 보다 정교하고 직관적인 로그 분석을 수행할 수 있도록 돕습니다.

<br>

## 주요 기능

### 1. AI 기반 로그 검색 및 분석
* **자연어 로그 설명**: 복잡한 로그 메시지를 AI가 이해하기 쉬운 자연어로 변환하여, 로그에 익숙하지 않은 개발자도 빠르게 원인을 파악할 수 있습니다. 예를 들어, `"ERROR com.makeLog.makeLog.LogInitializer - User does not exist"`와 같은 로그를 `"로그인 시도 중 사용자를 찾을 수 없음"`과 같이 직관적으로 설명합니다.
<img width="1441" height="810" alt="LogDetail" src="https://github.com/user-attachments/assets/1e388fb9-921b-41a7-8631-ce32720adbc7" />

* **자연어 로그 검색**: 전통적인 키워드 검색(BM25)과 의미 기반의 벡터 검색을 결합한 **하이브리드 검색**을 제공합니다. 이를 통해 `"어제 발생한 로그인 관련 에러"`와 같은 자연어 질의로도 원하는 로그를 정확하게 찾을 수 있습니다.
<img width="1455" height="819" alt="Search" src="https://github.com/user-attachments/assets/b3d2f7ff-87f7-4b1e-9d37-85fa604377a0" />

* **AI 트러블슈팅**: 에러 발생 시 AI가 자동으로 원인을 분석하고 해결 방법을 제안합니다. 이전 해결 사례를 저장하고 팀원들과 쉽게 공유할 수 있어, 문제 해결에 소요되는 시간을 최소화합니다.
<img width="1458" height="821" alt="Trouble Shooting" src="https://github.com/user-attachments/assets/0ad2e81a-d4f9-437e-8e93-b9796dfd98e1" />


### 2. 직관적인 대시보드
<img width="1456" height="818" alt="Main" src="https://github.com/user-attachments/assets/a8be40aa-da10-4a7b-b0b5-d4eaa5465b6c" />

* **실시간 모니터링**: 실시간으로 수집되는 로그를 시각화하여 시스템의 전반적인 상태를 한눈에 파악할 수 있습니다.
* **필터링 및 통계**: 로그 레벨(INFO, WARN, ERROR)별 필터링과 기간별 통계 그래프를 통해 필요한 정보를 효율적으로 분석합니다.
* **키워드 기반 분류**: 사용자가 설정한 키워드에 따라 로그를 자동 분류하여, 특정 기능이나 모듈별로 로그를 체계적으로 관리할 수 있습니다.

<br>

## 기술 스택

| 분류 | 기술 스택 | 설명 |
| :---: | :---: | :--- |
| **Server Framework** | ![fastapi](https://img.shields.io/badge/fastapi-009688?style=for-the-badge&logo=fastapi&logoColor=white) | 가볍고 빠른 API 서버를 구축합니다. |
| **AI Framework** | ![LangChain](https://img.shields.io/badge/LangChain-5E5E5E?style=for-the-badge&logo=langchain&logoColor=white) | 대규모 언어 모델(LLM) 기반의 자연어 처리와 분석 기능을 구현합니다. |
| **Web Framework** | ![react](https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black) | 직관적이고 사용자 친화적인 웹 대시보드를 개발합니다. |
| **Database** | ![mysql](https://img.shields.io/badge/mysql-4479A1?style=for-the-badge&logo=mysql&logoColor=white) ![elasticsearch](https://img.shields.io/badge/elasticsearch-005571?style=for-the-badge&logo=elasticsearch&logoColor=white) | 사용자 및 프로젝트 메타데이터는 MySQL에, 대규모 로그 데이터는 Elasticsearch에 저장하여 고속 검색을 지원합니다. |
| **Data Collection** | ![filebeat](https://img.shields.io/badge/filebeat-000000?style=for-the-badge&logo=elastic&logoColor=white) ![logstash](https://img.shields.io/badge/logstash-005571?style=for-the-badge&logo=logstash&logoColor=white) | Filebeat로 로그를 수집하고, Logstash로 데이터를 변환하여 정규화된 파이프라인을 구축합니다. |

### **기타**
| ![python](https://img.shields.io/badge/python-3776AB?style=for-the-badge&logo=python&logoColor=white) | ![typescript](https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white) | ![docker](https://img.shields.io/badge/docker-2496ED?style=for-the-badge&logo=docker&logoColor=white) | ![github actions](https://img.shields.io/badge/github%20actions-2671E5?style=for-the-badge&logo=githubactions&logoColor=white) |
| :--- | :--- | :--- | :--- |
| **Python**: 백엔드와 AI 로직 구현 | **TypeScript**: 프론트엔드 개발 언어 | **Docker**: 환경 구축 및 배포 | **GitHub Actions**: CI/CD 자동화 |

<br>

## 아키텍처

본 프로젝트의 시스템은 **로그 수집, 데이터 저장 및 처리, AI 분석, 사용자 인터페이스 제공**의 흐름으로 구성됩니다.

1.  **로그 수집**: 개발 환경의 로그는 **Filebeat**를 통해 수집되어 **Logstash**를 거치며 표준화된 형태로 가공됩니다.
2.  **데이터 저장 및 처리**: 가공된 로그는 **FastAPI** 서버를 통해 **Elasticsearch**에 저장됩니다. 사용자 및 프로젝트 메타데이터는 **MySQL**에 별도로 저장됩니다.
3.  **분석**: **LangChain** 기반의 AI 모듈이 로그 데이터를 해석하고, 하이브리드 검색을 통해 정확한 결과를 도출합니다.
4.  **UI 제공**: **React** 웹 대시보드를 통해 로그 데이터의 검색, 해석, 통계 및 실시간 모니터링이 가능합니다.

<img width="601" height="413" alt="Architecture_LognLook" src="https://github.com/user-attachments/assets/541a41cb-06cb-4cfd-8bd9-a146ffe890a9" />




<br>

## 진행 현황과 향후 계획

### 현재까지의 성과 (2025년 8월)

**LognLook**은 복잡하고 무거운 기존 솔루션과 달리, 가볍고 직관적인 사용성을 제공하며 로그 분석 과정을 단순화한 점에서 차별성을 갖습니다. 프로젝트를 진행하며 다양한 기술 스택을 학습하고 실제 환경에서 필요한 기능을 검증하는 과정을 통해 팀 역량을 높일 수 있었습니다.

* **핵심 기능 구현**: 자연어 기반의 로그 검색 및 AI 트러블슈팅 기능 구현을 완료하여, 복잡한 로그를 쉽게 해석하고 문제 해결에 필요한 시간을 단축할 수 있게 되었습니다.
* **통합 환경 구축**: 모든 모듈의 연동을 완료하고, API 통합 테스트를 진행하여 시스템의 안정성을 확보했습니다.
* **기본 대시보드 개발**: 에러 비율, 로그 레벨별 통계 등 핵심 지표를 시각화하는 기본 대시보드를 완성하여 시스템 상태를 한눈에 파악할 수 있도록 구현했습니다.

### 장기 목표 및 개선 방향

현재 시스템은 **로그 포맷 지원 범위**와 **대규모 환경에서의 성능**에 한계를 가지고 있으며, 특정 도메인 로그에 대한 AI 해석 정확도를 개선할 필요가 있습니다. 이러한 한계를 극복하기 위해 다음과 같은 장기적인 목표를 가지고 있습니다.

* **로그 처리 아키텍처 고도화**: 대용량 로그 처리를 위한 스트리밍 처리 아키텍처를 도입하여 시스템의 확장성과 안정성을 확보할 예정입니다.
* **AI 기능 강화**: 실제 오류 패턴을 반영한 LLM 학습 보강을 통해 해석의 정확성과 실용성을 높이고, 특정 에러 패턴이나 이상 징후를 자동 탐지하는 **이상 탐지 및 알림 시스템**을 구현할 계획입니다.
* **사용자 경험(UX) 개선**: 대시보드를 에러 비율, 모듈별 발생 빈도 등 핵심 지표 중심으로 개선하여 직관성을 높이고, 반복적인 유지보수 업무를 줄일 수 있는 기능을 추가하여 개발자 친화적인 서비스를 지향할 것입니다.
* **오픈소스 생태계 확장**: 다양한 개발 환경에서 적용 가능한 범용성을 확보하고, 커뮤니티 피드백을 반영하여 기능을 고도화함으로써 신뢰성 있는 개발 지원 도구로 발전하고자 합니다.

<br>

## 기여 방법

**LognLook** 프로젝트는 여러분의 기여를 환영합니다! 버그 리포트, 새로운 기능 제안, 코드 개선 등 다양한 방식으로 프로젝트에 참여할 수 있습니다.

자세한 기여 방법과 개발 환경 설정은 [**CONTRIBUTING.md**](./CONTRIBUTING.md) 파일을 참고해주세요. 여러분의 참여가 LognLook을 더욱 발전시키는 원동력이 됩니다.

<br>
<br>
<br>
<br>
<h6 align="center"> 
<br> 
Copyright © 2025 LognLook. All rights reserved. 
<br> 
<br> 
LognLook은 Apache 2.0 라이선스를 따릅니다. 
<br> 
<a href="https://www.apache.org/licenses/LICENSE-2.0">자세히 보기</a> 
</h6>
