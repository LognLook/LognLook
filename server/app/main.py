# Copyright 2025 LognLook
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from app.infra.database.session import engine, Base
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import user, project, pipeline, log, trouble

Base.metadata.create_all(bind=engine)
app = FastAPI()

# CORS 설정
origins = [
    "http://localhost:3000",  # React 개발 서버
    "http://localhost:5173",  # Vite 개발 서버
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메서드 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# 라우트 등록
app.include_router(user.router, prefix="/api", tags=["users"])
app.include_router(project.router, prefix="/api", tags=["projects"])
app.include_router(pipeline.router, prefix="/api", tags=["pipeline"])
app.include_router(log.router, prefix="/api", tags=["logs"])
app.include_router(trouble.router, prefix="/api", tags=["troubles"])


@app.get("/")
async def root() -> dict:
    return {"hello": "world"}
    # return RedirectResponse(url="/home/")


# if __name__ == "__main__":
#     uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
