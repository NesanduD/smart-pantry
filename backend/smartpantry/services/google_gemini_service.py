import os
import json
from google import genai
from google.genai import types
from PIL import Image

# Initialize client
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# The default active model
DEFAULT_MODEL = "gemini-3.6-flash"

# Whitelist of models your key actually has access to
SUPPORTED_MODELS = {
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemma-4-31b-it",
}

def resolve_model_name(model_name):
    """Keep stale frontend model selections from reaching the API."""
    if not model_name:
        return DEFAULT_MODEL
        
    normalized_name = str(model_name).strip().removeprefix("models/")
    
    # Map deprecated or frontend-specific names to actual active models
    if "gemma" in normalized_name.lower():
        return "gemma-4-31b-it"
    if normalized_name in ["gemini-2.0-flash", "gemini-1.5-flash"]:
        return DEFAULT_MODEL
        
    return normalized_name if normalized_name in SUPPORTED_MODELS else DEFAULT_MODEL


def identify_ingredients(image_path):
    """
    Opens a local image file and identifies ingredients.
    Always uses the default Gemini model since Gemma doesn't support vision well here.
    """
    try:
        image = Image.open(image_path)
        
        response = client.models.generate_content(
            model=DEFAULT_MODEL,
            contents=[
                "Identify all food ingredients in this image. Return ONLY a comma-separated list of items (e.g. 'tomato, onion, egg'). No other text.",
                image
            ]
        )
        return response.text.strip()
    except Exception as e:
        print(f"!!! GEMINI ERROR !!!: {e}")
        raise e


def suggest_recipes_from_ingredients(ingredients_list, model_name=DEFAULT_MODEL):
    """
    Suggests recipes based on ingredients and ensures clean JSON output.
    """
    active_model = resolve_model_name(model_name)
    ingredients_string = ', '.join(ingredients_list)
    
    prompt = f"""
You are an expert chef. I have these ingredients: {ingredients_string}.
Suggest up to 3 recipes.
IMPORTANT: Return the response ONLY as a valid JSON array of objects.
Each object must have: "title" and "instructions".

Format for "instructions":
Ingredients:
- [Item]
Step-by-Step:
1. [Action]
"""

    try:
        # Prepare the config (JSON enforcement is for Gemini models only)
        config = None
        if "gemma" not in active_model.lower():
            config = types.GenerateContentConfig(response_mime_type="application/json")

        # Call the API
        response = client.models.generate_content(
            model=active_model,
            contents=prompt,
            config=config
        )
        
        # Clean the text (remove markdown blocks if the model included them)
        clean_text = response.text.strip()
        if clean_text.startswith("```"):
            clean_text = clean_text.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            
        return clean_text

    except Exception as e:
        print(f"!!! {active_model} ERROR !!!: {e}")
        return "[]"