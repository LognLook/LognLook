<h1 align="leading">
  <br>
  LognLook 프로젝트에 기여하는 방법
</h1>

<br>

LognLook 프로젝트에 관심을 가져주셔서 감사합니다! 여러분의 기여는 LognLook을 더 나은 AI 로그 분석 도구로 만드는 데 큰 도움이 됩니다. 🚀

LognLook에 기여하는 방법은 다양합니다. 부담 없이 시작해 보세요!

* **코드 개선**: 버그 수정, 새로운 기능 추가 등 직접 코드를 개선할 수 있습니다. 💻
* **문서화**: 문서의 오타를 수정하거나, 내용을 더 명확하게 보완할 수 있습니다. ✍️
* **피드백 및 아이디어**: 버그 리포트, 기능 제안, 프로젝트에 대한 토론 등 다양한 방법으로 의견을 나눌 수 있습니다. 🤔

---

## 1. Git 컨벤션

일관된 코드 관리와 효율적인 협업을 위해 다음 Git 컨벤션을 준수해 주세요.

### 브랜치 네이밍

모든 작업은 **기본 브랜치**(`main`, `dev`)에서 직접 작업하지 않고, **작업 브랜치**를 생성하여 진행합니다.

* **기본 브랜치**
    * `main`: 프로덕션 코드의 기본 브랜치
    * `dev`: 개발용 기본 브랜치
* **작업 브랜치**
    모든 작업 브랜치는 다음 형식을 따라야 합니다:
    `{타입}/{영역}/{설명}`
    * **타입**: `feat` (기능), `bug` (버그), `hotfix` (긴급 수정), `refactor` (리팩토링), `docs` (문서), `chore` (도구/설정), `test` (테스트)
    * **영역**: `fe` (프론트엔드), `be` (백엔드), `common` (공통 코드)
    * **설명**: 작업 내용을 요약 (kebab-case 사용)

**예시:** `feat/fe/user-authentication`

### 커밋 메시지

커밋 메시지는 Git 히스토리를 명확하게 유지합니다.

`{타입}[{영역}]: <제목>`

* **제목**: 50자 이내, 영어로 작성, 명령문 형태
* **본문 (선택)**: 제목과 빈 줄로 구분, 한글로 '무엇을, 왜' 변경했는지 설명

### 풀 리퀘스트 (PR)

PR 제목과 설명은 다음 형식을 따릅니다.

* **제목**: `[{영역}] <타입>: <간결한 설명>` (예: `[FE] feat: 사용자 인증 UI 구현`)
* **설명**: `변경 사항`, `관련 이슈`, `테스트 방법`, `체크리스트` 등을 명시합니다.

---

## 2. 개발 환경 설정하기

### 백엔드 (Python/FastAPI)

* **언어**: Python 3.11.x
* **의존성 관리**: Poetry
* **설치**:
    ```bash
    # Poetry 설치
    curl -sSL [https://install.python-poetry.org](https://install.python-poetry.org) | python3 -

    cd server
    poetry install
    # 환경 변수(.env) 직접 생성 필요
    poetry run uvicorn app.main:app --reload
    ```

### 프론트엔드 (React)

* **언어**: TypeScript
* **환경**: Node.js (권장: 18+), npm
* **설치**:
    ```bash
    cd front
    npm install
    npm run dev
    # 브라우저에서 http://localhost:5173 접속
    ```

### 로그 수집 (선택사항)

LognLook은 다양한 로그 수집 도구와 연동할 수 있습니다. 여기서는 **Logstash를 예시**로 설정 방법을 안내합니다.

#### Logstash 설정 예시

1. Logstash의 `/config` 디렉토리에 `.conf` 파일을 생성합니다.
2. [예제 설정 파일](logstash/example.conf)을 참고하여 설정을 추가합니다:
   - **input**: Beats에서 포트 5044로 데이터를 수신
   - **output**: LognLook API 엔드포인트 `/api/pipeline`로 데이터 전송
   - **api-key**: 프로젝트 생성 또는 참가 후 프로젝트 설정에서 확인 가능한 API 키 사용

> **중요**: 예제 파일의 `YOUR_PROJECT_API_KEY`를 실제 프로젝트 API 키로 교체해야 합니다.

### 필요한 도구들 🛠️

* **백엔드**: Python 3.11.x, Poetry, MySQL, Elasticsearch
* **프론트엔드**: Node.js 18+, npm 9+
* **로그 수집**: Logstash (선택사항)
* **추가**: Docker, Git

### 테스트 실행 방법 🧪

* **백엔드**: `cd server` 후 `poetry run pytest`
* **프론트엔드**: `cd front` 후 `npm test`
> **참고**: 데이터베이스(MySQL) 및 Elasticsearch는 별도 설치 또는 Docker를 이용한 구동이 필요합니다.

---

## 3. 기여 유형별 안내

LognLook은 "fork and pull" 모델을 사용합니다. 기여자는 자신의 포크에 변경사항을 푸시하고, 이를 원본 저장소에 병합하기 위한 풀 리퀘스트를 생성합니다.

### 🐞 버그 리포트

예상치 못한 동작을 발견했다면 [버그 리포트 템플릿](https://github.com/LognLook/LognLook/issues/new?assignees=&labels=bug&projects=&template=bug_report.md)을 사용해 이슈를 생성해 주세요. 수정 사항을 포함한 PR도 환영합니다.

### ✅ 기능 제안

새로운 기능에 대한 아이디어가 있다면 [기능 제안 템플릿](https://github.com/LognLook/LognLook/issues/new?assignees=&labels=feature&projects=&template=feature_request.md)을 사용해 의견을 제시해 주세요.

### 📕 문서화 개선

문서의 오타나 개선할 점이 있다면 [문서화 이슈 템플릿](https://github.com/LognLook/LognLook/issues/new?assignees=&labels=documentation&projects=&template=documentation-improvement.md)을 사용해 알려주세요.

### Pull Request (PR) 제출하기

1.  [이곳](https://github.com/LognLook/LognLook/fork)을 클릭해 저장소를 포크하세요.
2.  `main` 브랜치에서 작업할 브랜치를 생성하고, 작업을 진행하세요.
3.  커밋 메시지 컨벤션을 준수하며 변경 사항을 커밋하세요.
4.  새로운 기능/버그 수정에 대한 **테스트 코드를 반드시 포함**하세요.
5.  GitHub에서 `LognLook:main` 브랜치로 PR을 생성하세요.

> 끝! 여러분의 기여에 감사드립니다! 😎

---

## 4. 코드 리뷰 및 병합

PR이 생성되면, LognLook 코어 개발자가 코드를 검토할 것입니다.

### 리뷰 정책 🧐

* 모든 PR은 최소 1명의 코어 개발자 승인이 필요합니다.
* 테스트 커버리지는 80% 이상을 유지해야 합니다.
* 모든 CI/CD 체크가 통과되어야 합니다.

### 병합 전략

* **`dev` 브랜치**: 여러 커밋을 하나로 합치는 **Squash and Merge** 방식을 사용합니다.
* **`main` 브랜치**: **Merge Commit** 방식을 사용합니다.

---

## 5. 기타 정보

### 다국어 지원 🌐

LognLook은 한국어와 영어를 지원합니다. 이슈와 PR은 두 언어 중 편한 언어로 작성해 주세요. 문서는 가능한 한 두 언어로 모두 작성하는 것을 권장합니다.

### 질문이나 도움이 필요하시면 ❓

* [GitHub Issues](https://github.com/LognLook/LognLook/issues/new/choose)
* [GitHub Discussions](https://github.com/LognLook/LognLook/discussions)
* [이메일](mailto:1224tpdud@gmail.com)

---

다시 한번 LognLook에 관심을 가져주셔서 감사합니다! 🚀
