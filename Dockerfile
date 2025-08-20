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

# Install numpy < 2.0 first to avoid conflicts
RUN pip install --no-cache-dir "numpy<2.0"

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Create startup script with PostGIS and schema setup
RUN echo '#!/bin/bash' > /var/www/startup.sh && \
    echo 'echo "Starting application setup..."' >> /var/www/startup.sh && \
    echo '' >> /var/www/startup.sh && \
    echo '# Create schema and PostGIS extension' >> /var/www/startup.sh && \
    echo 'echo "Creating schema and PostGIS extension..."' >> /var/www/startup.sh && \
    echo 'python << EOF' >> /var/www/startup.sh && \
    echo 'from app import app, db' >> /var/www/startup.sh && \
    echo 'from sqlalchemy import text' >> /var/www/startup.sh && \
    echo '' >> /var/www/startup.sh && \
    echo 'with app.app_context():' >> /var/www/startup.sh && \
    echo '    try:' >> /var/www/startup.sh && \
    echo '        # Create schema first' >> /var/www/startup.sh && \
    echo '        db.session.execute(text("CREATE SCHEMA IF NOT EXISTS trail_hub_schema"))' >> /var/www/startup.sh && \
    echo '        db.session.commit()' >> /var/www/startup.sh && \
    echo '        print("Schema created successfully")' >> /var/www/startup.sh && \
    echo '        ' >> /var/www/startup.sh && \
    echo '        # Then create PostGIS extension' >> /var/www/startup.sh && \
    echo '        db.session.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))' >> /var/www/startup.sh && \
    echo '        db.session.commit()' >> /var/www/startup.sh && \
    echo '        print("PostGIS extension created successfully")' >> /var/www/startup.sh && \
    echo '    except Exception as e:' >> /var/www/startup.sh && \
    echo '        print(f"Setup error: {e}")' >> /var/www/startup.sh && \
    echo '        db.session.rollback()' >> /var/www/startup.sh && \
    echo 'EOF' >> /var/www/startup.sh && \
    echo '' >> /var/www/startup.sh && \
    echo '# Run database migrations' >> /var/www/startup.sh && \
    echo 'echo "Running database migrations..."' >> /var/www/startup.sh && \
    echo 'flask db upgrade' >> /var/www/startup.sh && \
    echo '' >> /var/www/startup.sh && \
    echo '# Create tables if migrations fail' >> /var/www/startup.sh && \
    echo 'echo "Ensuring tables exist..."' >> /var/www/startup.sh && \
    echo 'python << EOF' >> /var/www/startup.sh && \
    echo 'from app import app, db' >> /var/www/startup.sh && \
    echo 'with app.app_context():' >> /var/www/startup.sh && \
    echo '    try:' >> /var/www/startup.sh && \
    echo '        db.create_all()' >> /var/www/startup.sh && \
    echo '        print("Tables created successfully")' >> /var/www/startup.sh && \
    echo '    except Exception as e:' >> /var/www/startup.sh && \
    echo '        print(f"Table creation error: {e}")' >> /var/www/startup.sh && \
    echo 'EOF' >> /var/www/startup.sh && \
    echo '' >> /var/www/startup.sh && \
    echo '# Seed database (optional - will continue if it fails)' >> /var/www/startup.sh && \
    echo 'echo "Seeding database..."' >> /var/www/startup.sh && \
    echo 'flask seed all || echo "Seeding skipped or already completed"' >> /var/www/startup.sh && \
    echo '' >> /var/www/startup.sh && \
    echo '# Start the application' >> /var/www/startup.sh && \
    echo 'echo "Starting Gunicorn..."' >> /var/www/startup.sh && \
    echo 'exec gunicorn app:app' >> /var/www/startup.sh && \
    chmod +x /var/www/startup.sh

# Set environment variables
ENV FLASK_APP=${FLASK_APP}
ENV FLASK_ENV=${FLASK_ENV}
ENV DATABASE_URL=${DATABASE_URL}
ENV SCHEMA=${SCHEMA}
ENV SECRET_KEY=${SECRET_KEY}

CMD ["/var/www/startup.sh"]
