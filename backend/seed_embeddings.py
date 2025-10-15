import json
import torch
import numpy as np
import requests
from io import BytesIO
from PIL import Image, UnidentifiedImageError
from transformers import CLIPProcessor, CLIPModel
import os

# ✅ Load CLIP model
print("🔍 Loading CLIP model...")
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

# ✅ Load product data
DATA_PATH = "data/products.json"
if not os.path.exists(DATA_PATH):
    raise FileNotFoundError(f"❌ {DATA_PATH} not found! Please make sure the file exists.")

with open(DATA_PATH, "r") as f:
    products = json.load(f)

embeddings = []
valid_products = []

def get_embedding(image_url):
    """Downloads image from URL and returns CLIP image embedding."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
    }
    try:
        response = requests.get(image_url, headers=headers, timeout=10)
        response.raise_for_status()
        image = Image.open(BytesIO(response.content)).convert("RGB")
    except (UnidentifiedImageError, requests.exceptions.RequestException) as e:
        print(f"❌ Skipping invalid image: {image_url} ({e})")
        return None

    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        emb = model.get_image_features(**inputs)
    return emb.squeeze().numpy()

# ✅ Generate embeddings
print("⚙️ Generating embeddings for products...")
for product in products:
    emb = get_embedding(product["image"])
    if emb is not None:
        embeddings.append(emb)
        valid_products.append(product)

# ✅ Save valid embeddings and product data
os.makedirs("data", exist_ok=True)
np.save("data/embeddings.npy", np.array(embeddings))
with open("data/valid_products.json", "w") as f:
    json.dump(valid_products, f, indent=2)

print(f"✅ Done! Saved {len(valid_products)} embeddings.")
