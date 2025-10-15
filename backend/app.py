from flask import Flask, request, jsonify
from transformers import CLIPProcessor, CLIPModel
from PIL import Image
from io import BytesIO
import torch
import numpy as np
import json
import requests
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# ✅ Load model and embeddings
print("🔍 Loading CLIP model and embeddings...")
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

embeddings = np.load("data/embeddings.npy")
with open("data/valid_products.json", "r") as f:
    products = json.load(f)

print(f"✅ Loaded {len(products)} product embeddings.")

# ✅ Helper functions
def get_image_embedding(image):
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        emb = model.get_image_features(**inputs)
    return emb.squeeze().numpy()

def cosine_similarity(a, b):
    a = np.array(a)
    b = np.array(b)

    if a.ndim == 1:
        a = a.reshape(1, -1)
    if b.ndim == 1:
        b = b.reshape(1, -1)

    a = a / np.linalg.norm(a, axis=1, keepdims=True)
    b = b / np.linalg.norm(b, axis=1, keepdims=True)

    return np.dot(a, b.T)

# ✅ Search route
@app.route("/search", methods=["POST"])
def search():
    if "image" not in request.files and not request.json.get("url"):
        return jsonify({"error": "Please provide an image file or image URL"}), 400

    # Get image from file or URL
    if "image" in request.files:
        image = Image.open(request.files["image"]).convert("RGB")
    else:
        image_url = request.json["url"]
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}
        response = requests.get(image_url, headers=headers)
        image = Image.open(BytesIO(response.content)).convert("RGB")

    query_emb = get_image_embedding(image)
    scores = cosine_similarity(query_emb, embeddings)

    # Filter indices where similarity is above 7   0%
    similarity_threshold = 0.7
    high_similarity_indices = np.where(scores[0] >= similarity_threshold)[0]
    
    # Sort the filtered indices by similarity score in descending order
    sorted_indices = high_similarity_indices[np.argsort(scores[0][high_similarity_indices])[::-1]]

    results = []
    for i in sorted_indices:
        results.append({
            "product": products[i],
            "similarity": float(scores[0][i])
        })

    if not results:
        
        return jsonify({"message": "No products found with similarity above 70%"}), 404

    return jsonify(results)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
