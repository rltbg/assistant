from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import os
from dotenv import load_dotenv

load_dotenv()

USER_AGENT = os.getenv("USER_AGENT", "EcoTrace/1.0")

app = FastAPI(title="EcoTrace API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/api/product/{barcode}")
async def get_product(barcode: str):
    try:
        resp = requests.get(
            f"https://world.openfoodfacts.org/api/v2/product/{barcode}.json",
            timeout=30,
            headers={"User-Agent": USER_AGENT},
        )
        data = resp.json()
    except requests.exceptions.RequestException:
        raise HTTPException(status_code=503, detail="OpenFoodFacts API unavailable")

    if data.get("status") == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return data["product"]
