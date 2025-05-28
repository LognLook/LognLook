from fastapi import FastAPI
from fastapi.responses import RedirectResponse
from app.infra.database.session import engine, Base
from app.api.routers import users, project, pipeline, log

Base.metadata.create_all(bind=engine)
app = FastAPI()


# 라우트 등록
app.include_router(users.router, prefix="/api", tags=["users"])
app.include_router(project.router, prefix="/api", tags=["project"])
app.include_router(pipeline.router, prefix="/api", tags=["pipeline"])
app.include_router(log.router, prefix="/api", tags=["log"])


@app.get("/")
async def root() -> dict:
    return {"hello": "world"}
    # return RedirectResponse(url="/home/")


# if __name__ == "__main__":
#     uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
