import base64
import io
import os
from typing import Optional

import numpy as np
import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from PIL import Image

import torch
import open_clip

app = FastAPI(title="Pet PawtrAIt CLIP Scorer Service")

DEVICE = "cpu"  # change to "cuda" if you ever give it a GPU

MODEL_NAME = os.getenv("CLIP_MODEL_NAME", "ViT-B-32")
PRETRAINED = os.getenv("CLIP_PRETRAINED", "laion2b_s34b_b79k")

print(f"Loading CLIP model {MODEL_NAME} / {PRETRAINED} on {DEVICE}...")

model, _, preprocess = open_clip.create_model_and_transforms(
    MODEL_NAME, pretrained=PRETRAINED, device=DEVICE
)
model.eval()

print("CLIP model loaded.")


class ScoreRequest(BaseModel):
    imageABase64: Optional[str] = None
    imageABase64: Optional[str] = None  # alias, in case we want flexibility
    imageAUrl: Optional[str] = None

    imageBBase64: Optional[str] = None
    imageBUrl: Optional[str] = None


class ScoreResponse(BaseModel):
    similarity_raw: float
    similarity_01: float  # scaled to 0..1
    message: str


def _load_image_from_base64(data: str) -> Image.Image:
    try:
        if "," in data:
            data = data.split(",", 1)[1]
        img_bytes = base64.b64decode(data)
        return Image.open(io.BytesIO(img_bytes)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid base64 image: {e}")


def _load_image_from_url(url: str) -> Image.Image:
    try:
        resp = requests.get(url, timeout=30)
        resp.raise_for_status()
        return Image.open(io.BytesIO(resp.content)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to fetch image from URL: {e}")


def _get_image_from_pair(base64_str: Optional[str], url: Optional[str]) -> Image.Image:
    if base64_str:
        return _load_image_from_base64(base64_str)
    if url:
        return _load_image_from_url(url)
    raise HTTPException(
        status_code=400,
        detail="Provide either base64 or URL for each image.",
    )


def _encode_image(img: Image.Image) -> torch.Tensor:
    img_tensor = preprocess(img).unsqueeze(0).to(DEVICE)
    with torch.no_grad():
        feat = model.encode_image(img_tensor)
        feat /= feat.norm(dim=-1, keepdim=True)
    return feat


@app.post("/score", response_model=ScoreResponse)
def score(req: ScoreRequest):
    # For convenience, accept imageABase64 or imageABase64
    img_a_b64 = req.imageABase64 or req.imageABase64

    if not (img_a_b64 or req.imageAUrl):
        raise HTTPException(status_code=400, detail="Missing image A.")
    if not (req.imageBBase64 or req.imageBUrl):
        raise HTTPException(status_code=400, detail="Missing image B.")

    img_a = _get_image_from_pair(img_a_b64, req.imageAUrl)
    img_b = _get_image_from_pair(req.imageBBase64, req.imageBUrl)

    feat_a = _encode_image(img_a)
    feat_b = _encode_image(img_b)

    # cosine similarity
    sim_raw = float((feat_a @ feat_b.T).cpu().numpy()[0][0])
    # map from [-1, 1] to [0, 1] for easier thresholds
    sim_01 = (sim_raw + 1.0) / 2.0

    msg = "Likeness OK" if sim_01 >= 0.6 else "Likeness possibly too low"

    return ScoreResponse(
        similarity_raw=sim_raw,
        similarity_01=sim_01,
        message=msg,
    )


@app.get("/health")
def health():
    return {"status": "ok"}
