from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.ocr import router as ocr_router
from routes.diplomas import router as diplomas_router
from routes.verification import router as verification_router


app = FastAPI(
    title="DVMS Backend API",
    description="Diploma Verification Management System",
    version="1.0.0",
)




# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# ROUTERS
# ============================================================

app.include_router(
    ocr_router,
)

app.include_router(
    diplomas_router,
)

app.include_router(
    verification_router,
)


# ============================================================
# ROOT
# ============================================================

@app.get("/")
def root():
    return {
        "success": True,
        "message": "DVMS Backend API aktif.",
    }


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "success": True,
        "status": "healthy",
    }