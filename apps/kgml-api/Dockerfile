FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PORT=8000

WORKDIR /service
COPY pyproject.toml ./
RUN pip install --no-cache-dir "fastapi>=0.116,<1.0" "pydantic>=2.11,<3.0" "uvicorn[standard]>=0.35,<1.0"
COPY app ./app

USER 65532:65532
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
