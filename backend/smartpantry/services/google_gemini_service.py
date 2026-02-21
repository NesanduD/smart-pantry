import os
import json
from google import genai
from google.genai import types
from PIL import Image

# Initialize client
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

# Use one of the IDs confirmed by your check_models script
MODEL_NAME = "gemma-3-12b-it" 

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

def suggest_recipes_from_ingredients(ingredients_list, model_name="gemini-3-flash-preview"):
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
        # 1. Prepare the config
        # We ONLY use response_mime_type if it's NOT a Gemma model
        config = None
        if "gemma" not in model_name.lower():
            config = types.GenerateContentConfig(response_mime_type="application/json")

        # 2. Call the API
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=config # This will be None for Gemma
        )
        
        # 3. Clean the text (Gemma often adds ```json ... ``` blocks)
        clean_text = response.text.strip()
        if clean_text.startswith("```"):
            # This removes ```json at the start and ``` at the end
            clean_text = clean_text.replace("```json", "").replace("```", "").strip()
            
        return clean_text

    except Exception as e:
        print(f"!!! {model_name} ERROR !!!: {e}")
        return "[]"
    # If the user didn't pick one, we default to the new Gemini 3 Flash
    prompt = f""" ... (keep your existing prompt here) ... """
    
    try:
        response = client.models.generate_content(
            model=model_name, # Use the dynamic model name!
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json"
            )
        )
        return response.text.strip()
    except Exception as e:
        print(f"!!! {model_name} ERROR !!!: {e}")
        return "[]"
    # Use the 2.0 Flash model for instant responses
    MODEL_NAME = "gemini-2.0-flash" 
    
    ingredients_string = ', '.join(ingredients_list)
    
    prompt = f"""
You are a fast-paced short-order chef. Use these ingredients: {ingredients_string}.
Suggest 3 quick recipes. Return ONLY a JSON array.

Format for "instructions":
Ingredients:
- [Item]
Step-by-Step:
1. [Action]

Keys: "title", "instructions". 
Keep steps short and direct. No preamble.
"""
    
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                temperature=0.7 # Lower temperature = faster, more focused answers
            )
        )
        return response.text.strip()
    except Exception as e:
        print(f"!!! SPEED ERROR !!!: {e}")
        return "[]"
    ingredients_string = ', '.join(ingredients_list)
    
    prompt = f"""
You are an expert chef. I have the following ingredients: {ingredients_string}.
Please suggest up to 3 recipes I can make using some or all of these items. 
You can assume I have basic staples like salt, pepper, oil, and water.

IMPORTANT: You must return the response ONLY as a valid JSON array of objects. Do not include markdown formatting like ```json.
Each object must have exactly two keys: "title" and "instructions".

The "instructions" string MUST strictly follow this exact format:

Ingredients:
- [Ingredient 1]
- [Ingredient 2]

Step-by-Step:
1. [Step 1]
2. [Step 2]
"""
    
    try:
        # NOTICE: We removed the config=types.GenerateContentConfig(...) part below!
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        
        clean_text = response.text.strip()
        if clean_text.startswith("```"):
            clean_text = clean_text.replace("```json", "").replace("```", "").strip()
            
        return clean_text
    except Exception as e:
        print(f"!!! RECIPE ERROR !!!: {e}")
        return "[]"
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