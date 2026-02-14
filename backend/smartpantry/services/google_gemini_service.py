# services/google_gemini_service.py
import os
from google import genai

# Initialize client with API key from environment
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

def identify_ingredients_from_url(image_url: str):
    """
    Sends an image URL to Google Gemini and asks it to describe ingredients.
    Returns the response text.
    """
    
    interaction = client.interactions.create(
        model="gemini-3-flash-preview",
        input=[
            {"type": "text", "text": "Identify all food ingredients in this image and return as a comma-separated list."},
            {
                "type": "image",
                "uri": image_url,
                "mime_type": "image/jpeg"  # adjust if PNG
            }
        ]
    )

    # Returns the text from the last output
    return interaction.outputs[-1].text