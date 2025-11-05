# Use Python 3.12 (requirements use numpy>=1.26)
FROM python:3.12-slim

WORKDIR /app

# system deps (if needed for numpy)
RUN apt-get update && apt-get install -y build-essential gcc && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy backend code
COPY backend /app

# Copy models into image so they are baked in
# (Ensure repository has models/ at repo root)
COPY models /app/models

ENV PYTHONUNBUFFERED=1
ENV MODELS_DIR=/app/models/regional_models

EXPOSE 8000

# Use PORT env provided by Railway (fallback to 8000)
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 4"]