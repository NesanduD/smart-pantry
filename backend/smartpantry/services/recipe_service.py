from .google_gemini_service import suggest_recipes_from_ingredients as generate_recipes

def suggest_recipes_from_ingredients(ingredients_list):
    """
    Accepts a list of ingredient names (e.g., ['tomato', 'egg', 'onion'])
    and returns a structured JSON list of recipes.
    """
    return generate_recipes(ingredients_list)