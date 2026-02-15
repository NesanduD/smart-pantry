import os
import json
from google import genai
from google.genai import types
from PIL import Image

# Initialize client
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# Use one of the IDs confirmed by your check_models script
MODEL_NAME = "gemini-2.5-flash" 

def identify_ingredients(image_path):
    """
    Opens a local image file and identifies ingredients.
    """
    try:
        image = Image.open(image_path)
        
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=[
                "Identify all food ingredients in this image. Return ONLY a comma-separated list of items (e.g. 'tomato, onion, egg'). No other text.",
                image
            ]
        )
        return response.text.strip()
    except Exception as e:
        print(f"!!! GEMINI ERROR !!!: {e}")
        raise e

def suggest_recipes_from_ingredients(ingredients_list):
    """
    Suggests 3 recipes based on ingredients and ensures clean JSON output.
    """
    prompt = f"""
    I have these ingredients: {', '.join(ingredients_list)}.
    Suggest 3 recipes I can make. 
    Return ONLY raw JSON. Do not include Markdown formatting or backticks.
    Structure:
    [
        {{
            "title": "Recipe Name",
            "ingredients_needed": ["item1", "item2"],
            "instructions": "Step 1..."
        }}
    ]
    """
    
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        
        # Clean up the response text in case the model adds markdown backticks
        clean_text = response.text.strip()
        if clean_text.startswith("```"):
            clean_text = clean_text.replace("```json", "").replace("```", "").strip()
            
        return clean_text
    except Exception as e:
        print(f"!!! RECIPE ERROR !!!: {e}")
        return "[]"