import re

# Published emission factors — kg CO₂ per tonne·km
# Sources: ECTA (sea), ADEME (road/rail), ICAO (air)
EMISSION_FACTORS = {
    "sea":     0.012,
    "road":    0.096,
    "rail":    0.028,
    "air":     0.602,
    "unknown": 0.096,  # fallback: road truck average
}

SCORE_THRESHOLDS = [
    ("A", 0.1),
    ("B", 0.5),
    ("C", 1.5),
    ("D", 4.0),
    ("E", float("inf")),
]


def parse_weight_kg(quantity: str) -> float:
    """Parse product weight from OpenFoodFacts quantity string (e.g. '400 g', '1 kg')."""
    if not quantity:
        return 0.1  # default 100 g
    match = re.search(r"(\d+(?:[.,]\d+)?)\s*(g|kg|ml|l|cl)", quantity.lower())
    if not match:
        return 0.1
    value = float(match.group(1).replace(",", "."))
    unit = match.group(2)
    if unit in ("kg", "l"):
        return value
    if unit in ("g", "ml"):
        return value / 1000
    if unit == "cl":
        return value / 100
    return 0.1


def grade_from_co2(total_kg: float) -> str:
    for grade, threshold in SCORE_THRESHOLDS:
        if total_kg < threshold:
            return grade
    return "E"


def apply_emission_factors(lifecycle: list, product_weight_kg: float) -> tuple[list, float]:
    """
    For each step with transport_mode + distance_km, compute co2_kg.
    Returns (updated lifecycle, total_co2_kg).
    Formula: co2_kg = (product_weight_kg / 1000) * distance_km * factor
    """
    total = 0.0
    for step in lifecycle:
        mode = (step.get("transport_mode") or "unknown").lower()
        distance = step.get("distance_km") or 0
        factor = EMISSION_FACTORS.get(mode, EMISSION_FACTORS["unknown"])
        co2 = (product_weight_kg / 1000) * distance * factor
        step["co2_kg"] = round(co2, 4)
        total += co2
    return lifecycle, round(total, 4)
