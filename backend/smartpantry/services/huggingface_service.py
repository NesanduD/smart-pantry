import os
from dotenv import load_dotenv
import requests

# Load variables from .env
load_dotenv()

HF_TOKEN = os.getenv("HUGGINGFACE_TOKEN")
if not HF_TOKEN:
    raise ValueError("HUGGINGFACE_TOKEN not found in .env")

API_URL = "https://api-inference.huggingface.co/models/eslamxm/vit-base-food101"

headers = {
    "Authorization": f"Bearer {HF_TOKEN}"
}

def query(filename):
    with open(filename, "rb") as f:
        image_bytes = f.read()

    response = requests.post(API_URL, headers=headers, files={"file": image_bytes})

    if response.status_code != 200:
        return {"error": f"HF API error {response.status_code}: {response.text}"}
    
    return response.json()

def recognize_food(image_url):
    response = requests.get(image_url)
    if response.status_code != 200:
        return {"error": f"Image fetch error {response.status_code}: {response.text}"}

    with open("temp.jpg", "wb") as f:
        f.write(response.content)

    return query("temp.jpg")
