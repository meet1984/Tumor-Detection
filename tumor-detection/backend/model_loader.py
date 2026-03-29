"""
model_loader.py
----------------
Loads the tumor detection model ONCE at startup (not per request).
Handles preprocessing and inference.

📌 INTEGRATION GUIDE:
  - Drop your model file into backend/ (e.g. tumor_model.h5 / tumor_model.pt)
  - Update MODEL_PATH below
  - Adjust IMG_SIZE to match your model's expected input
  - Update the framework block (TensorFlow OR PyTorch) to match yours
  - The predict() function must return {"prediction": str, "confidence": float}
"""

import os
import numpy as np
from PIL import Image
import io
import logging

logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────
# ⚙️  CONFIGURATION — EDIT THESE
# ─────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

MODEL_PATH = os.path.join(
    BASE_DIR,
    os.getenv("MODEL_PATH", "tumor_model.h5")
)

IMG_SIZE   = (128, 128)
FRAMEWORK  = os.getenv("FRAMEWORK", "tensorflow")

print("📂 Model path:", MODEL_PATH)
# Class labels — edit to match your model's output order
CLASS_LABELS = ["No Tumor", "Tumor"]  # index 0 → No Tumor, index 1 → Tumor

# ─────────────────────────────────────────────
# 🔧  MODEL HOLDER (module-level singleton)
# ─────────────────────────────────────────────
_model = None


def load_model() -> None:
    """
    Called ONCE at FastAPI startup.
    Loads the model into the module-level _model variable.
    """
    global _model

    if not os.path.exists(MODEL_PATH):
        logger.warning(
            f"⚠️  Model file '{MODEL_PATH}' not found. "
            "Running in DEMO mode — random predictions will be returned."
        )
        _model = "demo"
        return

    try:
        if FRAMEWORK == "tensorflow":
            _load_tensorflow_model()
        elif FRAMEWORK == "pytorch":
            _load_pytorch_model()
        else:
            raise ValueError(f"Unknown framework: {FRAMEWORK}. Use 'tensorflow' or 'pytorch'.")

        logger.info(f"✅ Model loaded successfully from '{MODEL_PATH}' [{FRAMEWORK}]")

    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}")
        raise RuntimeError(f"Model loading failed: {e}") from e


def _load_tensorflow_model() -> None:
    """Load a Keras/TensorFlow .h5 or SavedModel."""
    global _model
    import tensorflow as tf  # imported here to avoid startup cost if using PyTorch

    # Silence TF warnings
    os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"
    tf.get_logger().setLevel("ERROR")

    _model = tf.keras.models.load_model(MODEL_PATH)
    logger.info(f"TF model input shape: {_model.input_shape}")


def _load_pytorch_model() -> None:
    """
    Load a PyTorch model.
    Adjust this block to match how YOUR model was saved.
    """
    global _model
    import torch  # imported here to avoid startup cost if using TensorFlow

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # ── Option A: torch.save(model, path)  (full model saved)
    _model = torch.load(MODEL_PATH, map_location=device)

    # ── Option B: torch.save(model.state_dict(), path)  (weights only)
    # from your_model_module import YourModelClass
    # _model = YourModelClass()
    # _model.load_state_dict(torch.load(MODEL_PATH, map_location=device))

    _model.eval()
    logger.info(f"PyTorch model loaded on {device}")


# ─────────────────────────────────────────────
# 🖼️  IMAGE PREPROCESSING
# ─────────────────────────────────────────────
def _preprocess_image(image_bytes: bytes) -> np.ndarray:
    """
    Convert raw image bytes → model-ready numpy array.

    Steps:
      1. Open with Pillow (handles JPEG, PNG, DICOM-derived PNG, etc.)
      2. Convert to RGB (drops alpha channel, handles grayscale)
      3. Resize to IMG_SIZE
      4. Normalize pixel values to [0, 1]
      5. Add batch dimension → shape (1, H, W, 3)
    """
    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    arr = np.expand_dims(arr, axis=0)  # (1, H, W, 3)
    return arr


# ─────────────────────────────────────────────
# 🔮  PREDICTION
# ─────────────────────────────────────────────
def predict(image_bytes: bytes) -> dict:
    """
    Run inference on raw image bytes.

    Returns:
        {
            "prediction": "Tumor" | "No Tumor",
            "confidence": 94.72   # percentage, 0–100
        }
    """
    global _model

    if _model is None:
        raise RuntimeError("Model is not loaded. Call load_model() first.")

    # ── DEMO MODE (no model file found) ──────────────────────────────────
    if _model == "demo":
        import random
        label = random.choice(CLASS_LABELS)
        conf  = round(random.uniform(70.0, 99.5), 2)
        logger.debug(f"[DEMO] {label} @ {conf}%")
        return {"prediction": label, "confidence": conf}

    # ── PREPROCESS ────────────────────────────────────────────────────────
    input_arr = _preprocess_image(image_bytes)

    # ── INFERENCE ─────────────────────────────────────────────────────────
    if FRAMEWORK == "tensorflow":
        raw = _model.predict(input_arr, verbose=0)  # shape (1, N)
    elif FRAMEWORK == "pytorch":
        import torch
        import torch.nn.functional as F

        tensor = torch.tensor(input_arr).permute(0, 3, 1, 2)  # NCHW
        device = next(_model.parameters()).device
        tensor = tensor.to(device)

        with torch.no_grad():
            logits = _model(tensor)
            raw    = F.softmax(logits, dim=1).cpu().numpy()

    # ── DECODE OUTPUT ─────────────────────────────────────────────────────
    """
    Handles two common output shapes:

    Binary (sigmoid) → shape (1, 1) or (1,)
        • Single neuron, value in [0, 1]
        • 0 → CLASS_LABELS[0], 1 → CLASS_LABELS[1]

    Multi-class (softmax) → shape (1, N)
        • N neurons, argmax picks the class
    """
    probs = raw[0]  # remove batch dim

    if probs.ndim == 0 or probs.shape == (1,) or len(probs) == 1:
        # Binary sigmoid output
        score      = float(np.squeeze(probs))
        class_idx  = int(score >= 0.5)
        confidence = score if class_idx == 1 else (1.0 - score)
    else:
        # Multi-class softmax output
        class_idx  = int(np.argmax(probs))
        confidence = float(probs[class_idx])

    prediction = CLASS_LABELS[class_idx] if class_idx < len(CLASS_LABELS) else f"Class {class_idx}"
    confidence_pct = round(confidence * 100, 2)

    logger.info(f"Prediction: {prediction} | Confidence: {confidence_pct}%")
    return {"prediction": prediction, "confidence": confidence_pct}
