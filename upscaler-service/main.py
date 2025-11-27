# main.py
import base64
import io
import os
from typing import Optional

import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from PIL import Image

# Real-ESRGAN imports
from realesrgan import RealESRGANer
import torch

app = FastAPI(title="Pet PawtrAIt Upscaler Service")

# ---------- Model setup ----------

MODEL_SCALE = int(os.getenv("MODEL_SCALE", "4"))  # 2 or 4

# You’ll need to mount /models in the container
MODEL_PATH = os.getenv("MODEL_PATH", "/models/RealESRGAN_x4plus.pth")

# For CPU only:
DEVICE = "cpu"  # change to "cuda" if you deploy with GPU

# Init upscaler at startup so we don’t reload every request
print("Loading Real-ESRGAN model...")
upsampler = RealESRGANer(
    model_path=MODEL_PATH,
    scale=MODEL_SCALE,
    tile=0,        # no tiling by default; can tune later
    tile_pad=10,
    pre_pad=0,
    device=DEVICE,
)
print("Model loaded.")


class UpscaleRequest(BaseModel):
    imageBase64: Optional[str] = None
    imageUrl: Optional[str] = None
    scale: Optional[int] = None  # override if needed (2 or 4)


class UpscaleResponse(BaseModel):
    upscaledBase64: str
    width: int
    height: int
    scale: int


def load_image_from_base64(data: str) -> Image.Image:
    try:
        # Strip prefix if present: "data:image/png;base64,..."
        if "," in data:
            data = data.split(",", 1)[1]
        img_bytes = base64.b64decode(data)
        return Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 image: {e}")


def load_image_from_url(url: str) -> Image.Image:
    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        return Image.open(io.BytesIO(resp.content)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch image from URL: {e}")


@app.post("/upscale", response_model=UpscaleResponse)
def upscale(req: UpscaleRequest):
    if not req.imageBase64 and not req.imageUrl:
        raise HTTPException(status_code=400, detail="Provide imageBase64 or imageUrl.")

    scale = req.scale or MODEL_SCALE

    # Load image
    if req.imageBase64:
        img = load_image_from_base64(req.imageBase64)
    else:
        img = load_image_from_url(req.imageUrl)

    try:
        # Real-ESRGAN expects numpy / array, but RealESRGANer handles PIL images via helper
        up_img, _ = upsampler.enhance(img, outscale=scale)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upscaling failed: {e}")

    # Encode back to base64 PNG
    buffer = io.BytesIO()
    up_img.save(buffer, format="PNG")
    buffer.seek(0)
    out_b64 = base64.b64encode(buffer.read()).decode("utf-8")

    return UpscaleResponse(
        upscaledBase64=out_b64,
        width=up_img.width,
        height=up_img.height,
        scale=scale,
    )


@app.get("/health")
def health():
    return {"status": "ok"}
