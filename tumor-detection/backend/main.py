"""
main.py
--------
FastAPI application for Tumor Detection.

Endpoints:
  GET  /          → health check
  GET  /health    → detailed health + model status
  POST /predict   → tumor detection inference
"""

import logging
import time
from contextlib import asynccontextmanager
from typing import Annotated

from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from model_loader import load_model, predict

# ─────────────────────────────────────────────
# ⚙️  LOGGING
# ─────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# ⚙️  CONSTANTS
# ─────────────────────────────────────────────
MAX_FILE_SIZE_MB = 10
MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/bmp", "image/tiff"}

# ─────────────────────────────────────────────
# 🚀  LIFESPAN — load model once at startup
# ─────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🔄 Loading tumor detection model...")
    start = time.perf_counter()
    load_model()
    elapsed = time.perf_counter() - start
    logger.info(f"✅ Model ready in {elapsed:.2f}s")
    yield
    logger.info("🛑 Shutting down. Goodbye.")


# ─────────────────────────────────────────────
# 🏗️  APP FACTORY
# ─────────────────────────────────────────────
app = FastAPI(
    title="Tumor Detection API",
    description="Upload a medical image to receive a tumor detection prediction.",
    version="1.0.0",
    lifespan=lifespan,
)

# ─────────────────────────────────────────────
# 🌐  CORS
# ─────────────────────────────────────────────
# In production, replace "*" with your actual frontend URL:
# e.g. "https://your-app.vercel.app"
origins = [
    "http://localhost:5173",   # Vite dev server
    "http://localhost:3000",
    "https://your-frontend.vercel.app",  # ← update before deploying
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# 📦  RESPONSE SCHEMAS
# ─────────────────────────────────────────────
class PredictionResponse(BaseModel):
    prediction: str       # "Tumor" | "No Tumor"
    confidence: float     # 0.00 – 100.00
    processing_time_ms: float

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    version: str


# ─────────────────────────────────────────────
# 🛡️  VALIDATION HELPERS
# ─────────────────────────────────────────────
def _validate_image(file: UploadFile) -> None:
    """Raise HTTPException if the file is not a valid image."""
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=(
                f"Unsupported file type: '{file.content_type}'. "
                f"Accepted types: {', '.join(sorted(ALLOWED_CONTENT_TYPES))}"
            ),
        )


# ─────────────────────────────────────────────
# 🔌  ROUTES
# ─────────────────────────────────────────────
@app.get("/", include_in_schema=False)
async def root():
    return {"message": "Tumor Detection API is running. POST /predict to use."}


@app.get("/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Returns API health and model load status."""
    from model_loader import _model
    return HealthResponse(
        status="ok",
        model_loaded=_model is not None,
        version="1.0.0",
    )


@app.post(
    "/predict",
    response_model=PredictionResponse,
    tags=["Inference"],
    summary="Predict tumor from medical image",
    responses={
        200: {"description": "Prediction successful"},
        400: {"description": "Invalid input"},
        413: {"description": "File too large"},
        415: {"description": "Unsupported file type"},
        500: {"description": "Model inference error"},
    },
)
async def predict_tumor(
    file: Annotated[UploadFile, File(description="Medical image (JPEG, PNG, WEBP, BMP, TIFF)")]
):
    """
    Upload a medical image and receive a tumor detection result.

    - **prediction**: `"Tumor"` or `"No Tumor"`
    - **confidence**: Percentage confidence (0–100)
    - **processing_time_ms**: Server-side inference time in milliseconds
    """
    # ── Validate content type ─────────────────────────────────────────────
    _validate_image(file)

    # ── Read & validate size ──────────────────────────────────────────────
    image_bytes = await file.read()
    if len(image_bytes) > MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size {len(image_bytes) / 1024 / 1024:.1f} MB exceeds limit of {MAX_FILE_SIZE_MB} MB.",
        )
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    # ── Inference ─────────────────────────────────────────────────────────
    try:
        t0 = time.perf_counter()
        result = predict(image_bytes)
        elapsed_ms = round((time.perf_counter() - t0) * 1000, 2)
    except Exception as exc:
        logger.exception("Inference error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Model inference failed: {str(exc)}",
        ) from exc

    logger.info(
        f"[/predict] file={file.filename!r} "
        f"size={len(image_bytes)/1024:.1f}KB "
        f"→ {result['prediction']} ({result['confidence']}%) "
        f"in {elapsed_ms}ms"
    )

    return PredictionResponse(
        prediction=result["prediction"],
        confidence=result["confidence"],
        processing_time_ms=elapsed_ms,
    )


# ─────────────────────────────────────────────
# 🏃  ENTRY POINT (local dev)
# ─────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
