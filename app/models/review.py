from .db import db, environment, SCHEMA, add_prefix_for_prod
from datetime import datetime


class Review(db.Model):
    __tablename__ = 'reviews'

    if environment == "production":
        __table_args__ = {'schema': SCHEMA}

    id = db.Column(db.Integer, primary_key=True)
    trail_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('trails.id')), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey(add_prefix_for_prod('users.id')), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 stars
    title = db.Column(db.String(200))
    content = db.Column(db.Text, nullable=False)

    # These are for conditions during hike
    hiked_date = db.Column(db.Date, nullable=False)
    weather_condition = db.Column(db.String(50))  # sunny, cloudy, rainy, snowy
    trail_condition = db.Column(db.String(50))  # excellent, good, muddy, icy, poor
    crowd_level = db.Column(db.String(20))  # empty, light, moderate, crowded

    # This is to store helpful votes
    helpful_count = db.Column(db.Integer, default=0)

    # Here are additional information about the review - metadata
    is_verified_hike = db.Column(db.Boolean, default=False)  # GPS verified
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # This defines the relationships
    trail = db.relationship('Trail', back_populates='reviews')
    author = db.relationship('User', back_populates='reviews')

    # This is to ensure one review per user per trail
    __table_args__ = (
        db.UniqueConstraint('trail_id', 'user_id', name='_trail_user_uc'),
        {'schema': SCHEMA} if environment == "production" else {}
    )

    def to_dict(self):
        return {
            'id': self.id,
            'trail_id': self.trail_id,
            'user_id': self.user_id,
            'rating': self.rating,
            'title': self.title,
            'content': self.content,
            'hiked_date': self.hiked_date.isoformat() if self.hiked_date else None,
            'weather_condition': self.weather_condition,
            'trail_condition': self.trail_condition,
            'crowd_level': self.crowd_level,
            'helpful_count': self.helpful_count,
            'is_verified_hike': self.is_verified_hike,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'author': self.author.to_dict_basic() if self.author else None,
            'trail': {
                'id': self.trail.id,
                'name': self.trail.name,
                'difficulty': self.trail.difficulty
            } if self.trail else None
        }

    # Validate review data
    def validate(self):
        errors = {}

        if not self.rating or self.rating < 1 or self.rating > 5:
            errors['rating'] = 'Rating must be between 1 and 5'

        if not self.content or len(self.content.strip()) == 0:
            errors['content'] = 'Review content cannot be empty'

        if not self.hiked_date:
            errors['hiked_date'] = 'Hiked date is required'
        elif self.hiked_date > datetime.now().date():
            errors['hiked_date'] = 'Hiked date cannot be in the future'

        if self.weather_condition and self.weather_condition not in ['sunny', 'cloudy', 'rainy', 'snowy']:
            errors['weather_condition'] = 'Invalid weather condition'

        if self.trail_condition and self.trail_condition not in ['excellent', 'good', 'muddy', 'icy', 'poor']:
            errors['trail_condition'] = 'Invalid trail condition'

        if self.crowd_level and self.crowd_level not in ['empty', 'light', 'moderate', 'crowded']:
            errors['crowd_level'] = 'Invalid crowd level'

        return errors
