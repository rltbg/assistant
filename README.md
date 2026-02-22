# EcoTrace

Scan a food product's barcode and trace its full supply chain — where each ingredient comes from, how it travels, and the distances involved.

**Live demo:** [hackathon.rltbg.com](https://hackathon.rltbg.com)

**Youtube video:** [https://youtu.be/efZUCr14bko](https://youtu.be/efZUCr14bko)

---

## Stack

- **Frontend** — React + TypeScript + Tailwind CSS, managed with Bun
- **Backend** — FastAPI + Python 3.12, managed with uv
- **AI** — Gemini 2.5 Flash with native Google Search grounding

---

## Run locally

**Prerequisites:** Docker + Docker Compose

**1. Clone the repo**

```bash
git clone <repo-url>
cd assistant
```

**2. Create the backend environment file**

```bash
cp backend/.env.example backend/.env
```

Fill in your API key in `backend/.env`:

```env
USER_AGENT=EcoTrace/1.0
GEMINI_API_KEY=your_key_here
```

Get a free Gemini API key at [aistudio.google.com](https://aistudio.google.com).

**3. Start everything**

```bash
docker compose up --build
```

- App: [http://localhost:3001](http://localhost:3001)
- API: [http://localhost:8001/api](http://localhost:8001/api)
- API docs: [http://localhost:8001/docs](http://localhost:8001/docs)

---

## How it works

1. Scan a barcode with the camera (or type it manually)
2. Product data is fetched from [OpenFoodFacts](https://world.openfoodfacts.org/) — ingredients, nutrition, scores
3. Gemini searches the web to reconstruct the supply chain of each ingredient: origin countries, transport modes, distances
4. The app displays the full journey as a timeline with locations and distances

---

## Codebase overview

```
assistant/
├── docker-compose.yml
├── backend/
│   ├── main.py               # FastAPI app — two endpoints: GET /api/product/:barcode, POST /api/analyze
│   ├── analysis.py           # Gemini call with Google Search grounding, JSON extraction, source dedup
│   ├── prompts/
│   │   └── analysis_system.md  # System prompt — instructs Gemini to return lifecycle steps with transport_mode + distance_km
│   └── pyproject.toml
└── frontend/
    └── src/
        ├── pages/
        │   ├── LandingPage.tsx   # Home screen — barcode input + location picker
        │   ├── ScannerPage.tsx   # Camera barcode scanner (html5-qrcode, EAN-13/UPC)
        │   └── ProductPage.tsx   # Main product view — fetches product, auto-triggers analysis
        ├── components/
        │   ├── CarbonMeter.tsx   # Supply chain timeline — lifecycle steps, distances, sources
        │   ├── ScoreBadge.tsx    # Nutri-Score / NOVA / Eco-Score badges
        │   ├── NutrientLevelBar.tsx
        │   └── LocationPicker.tsx
        ├── api/
        │   └── product.ts        # fetchProduct() + analyzeProduct() — typed API calls
        └── types/
            └── product.ts        # TypeScript interfaces for Product, AnalysisResult, LifecycleStep
```

### Backend

**`GET /api/product/:barcode`** — proxies OpenFoodFacts v2 API and returns the raw product object. Uses `requests` directly (the official SDK has a 10s timeout too short for some products).

**`POST /api/analyze`** — takes `{ product_name, brand, ingredients, origins, user_location }` and calls `run_analysis()` in a thread via `asyncio.to_thread` to avoid blocking the event loop.

**`analysis.py`** — builds a Gemini request with a `GoogleSearch` grounding tool attached. Gemini searches the web autonomously to find where ingredients are sourced, where the product is manufactured, and how it reaches the user. The response is a structured JSON with a `lifecycle` array (one entry per supply chain step). Grounding sources (title + URL) are extracted from `grounding_metadata.grounding_chunks` and appended to the result.

### Frontend

**`ProductPage`** — fetches the product on mount, then immediately fires `analyzeProduct()` in parallel. The product info (image, scores, nutrition) renders as soon as OpenFoodFacts responds; the supply chain timeline fills in when the Gemini analysis completes (~5–10s).

**`CarbonMeter`** — displays the lifecycle timeline. Each step shows the stage name, location, a short description, transport mode, and distance to the next step. Sources are listed at the bottom as clickable links.

**`ScannerPage`** — uses `Html5Qrcode` with explicit format support (`EAN_13`, `EAN_8`, `UPC_A`, `UPC_E`, `CODE_128`). Tries `facingMode: environment` first (works on iOS), falls back to camera enumeration by ID (more reliable on Android).
