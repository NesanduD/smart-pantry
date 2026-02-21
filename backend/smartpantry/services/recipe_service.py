import os
from google import genai
from google.genai import types

# Reuse the client initialization
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

def suggest_recipes_from_ingredients(ingredients_list):
    """
    Accepts a list of ingredient names (e.g., ['tomato', 'egg', 'onion'])
    and returns a structured JSON list of recipes.
    """
    prompt = f"""
    I have these ingredients: {', '.join(ingredients_list)}.
    Suggest 3 recipes I can make. 
    Return ONLY raw JSON. Do not use Markdown formatting.
    Structure:
    [
        {{
            "title": "Recipe Name",
            "ingredients_needed": ["item1", "item2"]
            "instructions": "Step 1..."
        }}
    ]
    """
    
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash", # or "gemini-1.5-flash"
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        return response.text
    except Exception as e:
        return []