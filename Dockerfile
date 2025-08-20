FROM python:3.9.18-alpine3.18

# Install build dependencies
RUN apk add --no-cache \
    build-base \
    postgresql-dev \
    gcc \
    python3-dev \
    musl-dev \
    # Spatial libraries for PostGIS/Shapely
    geos \
    geos-dev \
    proj \
    proj-dev \
    gdal \
    gdal-dev \
    # Additional dependencies for numpy/shapely
    openblas-dev \
    lapack-dev \
    gfortran \
    # Required for some Python packages
    libffi-dev \
    openssl-dev

ARG FLASK_APP
ARG FLASK_ENV
ARG DATABASE_URL
ARG SCHEMA
ARG SECRET_KEY

WORKDIR /var/www

COPY requirements.txt .

# Installing numpy first to avoid import issues
RUN pip install --no-cache-dir numpy

# Install the rest of the requirements
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir psycopg2

COPY . .

# Setting Flask environment variables for the build commands
ENV FLASK_APP=${FLASK_APP}
ENV FLASK_ENV=${FLASK_ENV}
ENV DATABASE_URL=${DATABASE_URL}
ENV SCHEMA=${SCHEMA}
ENV SECRET_KEY=${SECRET_KEY}

RUN flask db upgrade
RUN flask seed all

CMD gunicorn app:app
