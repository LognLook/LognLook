from fastapi import APIRouter, Depends, HTTPException, Query
from app.schemas.trouble import (
    TroubleCreate, 
    Trouble, 
    TroubleUpdate, 
    TroubleListQuery, 
    TroubleListResponse
)
from sqlalchemy.orm import Session
from app.infra.database.session import get_db
from typing import Optional

router = APIRouter()


@router.post("/trouble", response_model=Trouble)
def create_trouble(trouble: TroubleCreate, db: Session = Depends(get_db)):
    # TODO: 현재 사용자 정보를 가져와서 created_by 설정
    pass

@router.get("/trouble/{trouble_id}", response_model=Trouble)
def get_trouble(trouble_id: int, db: Session = Depends(get_db)):
    # TODO: trouble 조회 로직 구현
    pass

@router.put("/trouble/{trouble_id}", response_model=Trouble)
def update_trouble(trouble_id: int, trouble_update: TroubleUpdate, db: Session = Depends(get_db)):
    # TODO: trouble 업데이트 로직 구현
    pass

@router.delete("/trouble/{trouble_id}")
def delete_trouble(trouble_id: int, db: Session = Depends(get_db)):
    # TODO: trouble 삭제 로직 구현
    pass

@router.get("/project/{project_id}/troubles", response_model=TroubleListResponse)
def get_project_troubles(query: TroubleListQuery, db: Session = Depends(get_db)):
    # TODO: 프로젝트별 trouble 목록 조회 로직 구현 (페이지네이션 포함)
    pass