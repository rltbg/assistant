# EcoTrace — Carbon Footprint Scanner

Application web mobile-first pour estimer l'empreinte carbone des produits alimentaires via scan de code-barre.

## Architecture

- **Frontend** (`frontend/`): React + TypeScript + Vite, géré avec **Bun**, Tailwind CSS
- **Backend** (`backend/`): FastAPI + Python 3.12, géré avec **uv**
- **Infrastructure**: Docker + Docker Compose (monorepo)

## Démarrage rapide

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api
- API docs: http://localhost:8000/docs

## Structure

```
/
├── CLAUDE.md
├── docker-compose.yml
├── .gitignore
├── backend/
│   ├── Dockerfile
│   ├── main.py          # FastAPI app
│   ├── pyproject.toml
│   └── .env             # USER_AGENT=EcoTrace/1.0
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json      # Bun
    ├── vite.config.ts
    └── src/
        ├── pages/        # LandingPage, ScannerPage, ProductPage
        ├── components/   # ScoreBadge, LocationPicker, CarbonMeter...
        ├── api/          # product.ts → fetch /api/product/:barcode
        └── types/        # product.ts → TypeScript interfaces
```

## Conventions

### Frontend
- Composants en PascalCase dans `src/components/`
- Pages dans `src/pages/`
- Couleur principale: orange `#F97316` (brand-500 dans tailwind config)
- Mobile-first, breakpoints Tailwind standard
- API calls via `/api/` (proxied par nginx en prod, par Vite dev server en dev)

### Backend
- Endpoints sous `/api/`
- OpenFoodFacts v2 API pour les données produits (utiliser `requests` directement, pas le SDK — timeout trop court)
- Variables d'env dans `backend/.env`

## Variables d'environnement

### `backend/.env`
```
USER_AGENT=EcoTrace/1.0
```

## OpenFoodFacts — champs clés utilisés

| Champ | Usage |
|---|---|
| `product_name` | Nom du produit |
| `brands` | Marque (prendre le premier si plusieurs) |
| `quantity` | Quantité |
| `image_front_url` | Image principale |
| `nutriscore_grade` | Score A-E (lowercase) |
| `nova_group` | Groupe 1-4 (int) |
| `ecoscore_grade` | Score eco A-E ou "unknown" |
| `nutrient_levels` | dict: fat/salt/sugars/saturated-fat → low/moderate/high |
| `nutriments` | Valeurs nutritionnelles per 100g |
| `ingredients_text_fr` | Liste des ingrédients |
| `origins_tags` | Origines du produit |

## Stack IA (à venir)

- **Google ADK** pour le système multi-agent
- **LiteLLM + Crusoe API** pour l'inférence
- Agents: recherche des usines, calcul du trajet par mode de transport, estimation CO₂
