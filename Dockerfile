FROM python:3.9-slim-bullseye

# Install dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    gdal-bin \
    libgdal-dev \
    libgeos-dev \
    libproj-dev \
    && rm -rf /var/lib/apt/lists/*

ARG FLASK_APP
ARG FLASK_ENV
ARG DATABASE_URL
ARG SCHEMA
ARG SECRET_KEY

WORKDIR /var/www

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create startup script
RUN echo '#!/bin/bash' > /var/www/startup.sh && \
    echo 'flask db upgrade' >> /var/www/startup.sh && \
    echo 'flask seed all' >> /var/www/startup.sh && \
    echo 'exec gunicorn app:app' >> /var/www/startup.sh && \
    chmod +x /var/www/startup.sh

# Set environment variables
ENV FLASK_APP=${FLASK_APP}
ENV FLASK_ENV=${FLASK_ENV}
ENV DATABASE_URL=${DATABASE_URL}
ENV SCHEMA=${SCHEMA}
ENV SECRET_KEY=${SECRET_KEY}

CMD ["/var/www/startup.sh"]
