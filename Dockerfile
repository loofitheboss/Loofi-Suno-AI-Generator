# syntax=docker/dockerfile:1

FROM node:25-alpine AS frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY index.html ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY src ./src
RUN npm run build

FROM python:3.12-slim AS app
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

COPY server/requirements.txt /app/server/requirements.txt
RUN pip install --no-cache-dir -r /app/server/requirements.txt

COPY server /app/server
COPY --from=frontend-builder /app/dist /app/dist
COPY logo.png /app/logo.png

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--app-dir", "/app/server"]
