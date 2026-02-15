import os
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

print("--- Available Models for Your Key ---")
try:
    for model in client.models.list():
        # Safely check if the model supports generating content
        # Some versions use 'supported_generation_methods', others 'supportedGenerationMethods'
        methods = getattr(model, 'supported_generation_methods', [])
        
        if "generateContent" in str(methods):
            print(f"✅ Model ID: {model.name}")
        else:
            # If the attribute check fails, just print everything to see what we have
            print(f"❓ Found: {model.name}")

except Exception as e:
    print(f"❌ Error: {e}")