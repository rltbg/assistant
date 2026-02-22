import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import os
import json
import hashlib
import valkey
from dotenv import load_dotenv

load_dotenv()

valkey_host = os.getenv("VALKEY_HOST", "valkey")
valkey_client = valkey.Valkey(host=valkey_host, port=6379, db=0)

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
    cache_key = f"product:{barcode}"
    try:
        cached = valkey_client.get(cache_key)
        if cached:
            return json.loads(cached)
    except Exception as cache_err:
        print(f"Cache read error: {cache_err}")

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

    try:
        # Cache for 1 day
        valkey_client.setex(cache_key, 86400, json.dumps(data["product"]))
    except Exception as cache_err:
        print(f"Cache write error: {cache_err}")

    return data["product"]


@app.post("/api/analyze")
async def analyze_product(req: AnalyzeRequest):
    from analysis import run_analysis

    try:
        # Generate a unique cache key for the request payload
        req_dict = req.model_dump()
        req_hash = hashlib.sha256(json.dumps(req_dict, sort_keys=True).encode()).hexdigest()
        cache_key = f"analyze:{req_hash}"

        try:
            cached = valkey_client.get(cache_key)
            if cached:
                return json.loads(cached)
        except Exception as cache_err:
            print(f"Cache read error: {cache_err}")

        result = await asyncio.to_thread(
            run_analysis,
            product_name=req.product_name,
            brand=req.brand,
            ingredients=req.ingredients,
            origins=req.origins,
            user_location=req.user_location,
        )

        try:
            # Cache for 7 days (604800 seconds)
            valkey_client.setex(cache_key, 604800, json.dumps(result))
        except Exception as cache_err:
            print(f"Cache write error: {cache_err}")

        return result
    except KeyError as e:
        raise HTTPException(status_code=500, detail=f"Missing env variable: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
