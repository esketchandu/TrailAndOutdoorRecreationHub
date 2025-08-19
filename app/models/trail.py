from .db import db, environment, SCHEMA, add_prefix_for_prod
from geoalchemy2 import Geometry
from geoalchemy2.shape import to_shape
from shapely.geometry import mapping
from datetime import datetime


class Trail(db.Model):
    __tablename__ = 'trails'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, index=True)
    description = db.Column(db.Text)
    difficulty = db.Column(db.String(20), nullable=False)  # easy, moderate, hard, expert
    length_km = db.Column(db.Float, nullable=False)
    elevation_gain_m = db.Column(db.Float)

    # This is for spatial data - LineString is used for the trail path
    geometry = db.Column(Geometry('LINESTRING', srid=4326), nullable=False)

    # This is basic location info
    region = db.Column(db.String(100))
    parking_info = db.Column(db.Text)

    # Here is additional information about the trail - metadata
    created_by = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # This is to store aggregated data that will be updated periodically
    avg_rating = db.Column(db.Float, default=0.0)
    total_reviews = db.Column(db.Integer, default=0)

    # This defines the relationships
    creator = db.relationship('User', back_populates='created_trails')
    reviews = db.relationship('Review', back_populates='trail', lazy='dynamic', cascade='all, delete-orphan')


    # Convert trail to dictionary with GeoJSON geometry
    # Convert geometry to GeoJSON format if it exists
    def to_dict(self):
        geojson = None
        if self.geometry:
            shape = to_shape(self.geometry)
            geojson = mapping(shape)

        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'difficulty': self.difficulty,
            'length_km': self.length_km,
            'elevation_gain_m': self.elevation_gain_m,
            'geometry': geojson,
            'region': self.region,
            'parking_info': self.parking_info,
            'avg_rating': round(self.avg_rating, 1) if self.avg_rating else 0,
            'total_reviews': self.total_reviews,
            'created_by': self.created_by,
            'creator': self.creator.to_dict_basic() if self.creator else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

    # Basic trail info for list views
    # Convert geometry to GeoJSON format if it exists
    def to_dict_basic(self):
        geojson = None
        if self.geometry:
            shape = to_shape(self.geometry)
            geojson = mapping(shape)

        return {
            'id': self.id,
            'name': self.name,
            'difficulty': self.difficulty,
            'length_km': self.length_km,
            'elevation_gain_m': self.elevation_gain_m,
            'geometry': geojson,
            'region': self.region,
            'avg_rating': round(self.avg_rating, 1) if self.avg_rating else 0,
            'total_reviews': self.total_reviews,
            'creator': self.creator.to_dict_basic() if self.creator else None
        }

    # Update average rating and review count
    def update_rating_stats(self):
        if self.reviews:
            ratings = [review.rating for review in self.reviews if review.rating]
            self.total_reviews = len(ratings)
            self.avg_rating = sum(ratings) / len(ratings) if ratings else 0
        else:
            self.total_reviews = 0
            self.avg_rating = 0
        db.session.commit()
