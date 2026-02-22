import json
import os
import re
from pathlib import Path

from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

SYSTEM_PROMPT = (Path(__file__).parent / "prompts" / "analysis_system.md").read_text()
MODEL = "gemini-2.5-flash"


def _extract_json(text: str) -> dict:
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
    match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if match:
        return json.loads(match.group(1))
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group(0))
    raise ValueError(f"No JSON found in response: {text[:200]}")


def run_analysis(
    product_name: str,
    brand: str,
    ingredients: str,
    origins: str,
    user_location: str,
) -> dict:
    client = genai.Client(api_key=os.environ["GEMINI_API_KEY"])

    grounding_tool = types.Tool(google_search=types.GoogleSearch())
    config = types.GenerateContentConfig(
        tools=[grounding_tool],
        system_instruction=SYSTEM_PROMPT,
    )

    user_message = f"""Trace the full lifecycle of this product for a consumer in {user_location}:

Product: {product_name}
Brand: {brand}
Ingredients: {ingredients or "Not specified"}
Known origin info: {origins or "Unknown — search for it"}

Search the web to find where each main ingredient comes from, where the product is made, and how it reaches {user_location}.
Return ONLY a valid JSON object, no other text."""

    response = client.models.generate_content(
        model=MODEL,
        contents=user_message,
        config=config,
    )

    text = response.candidates[0].content.parts[0].text

    # Extract grounding sources — title + uri pairs from grounding_chunks
    sources = []
    grounding = response.candidates[0].grounding_metadata
    if grounding:
        for chunk in grounding.grounding_chunks or []:
            if chunk.web and chunk.web.uri:
                sources.append({
                    "title": chunk.web.title or chunk.web.uri,
                    "uri": chunk.web.uri,
                })
        seen = set()
        unique = []
        for s in sources:
            if s["uri"] not in seen:
                seen.add(s["uri"])
                unique.append(s)
        sources = unique[:6]

    result = _extract_json(text)
    result["sources"] = sources
    return result


if __name__ == "__main__":
    result = run_analysis(
        product_name="Nutella 400g",
        brand="Ferrero",
        ingredients="Sugar, palm oil, hazelnuts 13%, cocoa 7.4%, skimmed milk powder 6.6%",
        origins="",
        user_location="Paris, France",
    )
    print(json.dumps(result, indent=2, ensure_ascii=False))
