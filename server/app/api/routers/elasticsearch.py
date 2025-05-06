from fastapi import APIRouter, HTTPException


router = APIRouter()


# @router.post("/api/elasticsearch")
# async def receive_log(log_data: LogData):
#     try:
#         result = await create_log(log_data)
#         return {"status": "success", "data": result}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))
