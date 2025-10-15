# Use official Python runtime as base image
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code and data
COPY app.py .
COPY seed_embeddings.py .
COPY data/ ./data/

# Generate embeddings during build (if embeddings.npy doesn't exist)
RUN python seed_embeddings.py || echo "Embeddings already exist"

# Expose port (Cloud Run will override with PORT env var)
EXPOSE 8080

# Set environment variable
ENV PORT=8080

# Run the application
CMD exec gunicorn --bind :$PORT --workers 1 --threads 8 --timeout 0 app:app
