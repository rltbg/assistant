import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
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


class AnalyzeRequest(BaseModel):
    product_name: str
    brand: str
    ingredients: str = ""
    origins: str = ""
    user_location: str = "France"


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


@app.post("/api/analyze")
async def analyze_product(req: AnalyzeRequest):
    from analysis import run_analysis

    try:
        result = await asyncio.to_thread(
            run_analysis,
            product_name=req.product_name,
            brand=req.brand,
            ingredients=req.ingredients,
            origins=req.origins,
            user_location=req.user_location,
        )
        return result
    except KeyError as e:
        raise HTTPException(status_code=500, detail=f"Missing env variable: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
