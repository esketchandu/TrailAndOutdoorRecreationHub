from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Trail, Review
from datetime import datetime
from sqlalchemy.exc import IntegrityError

review_routes = Blueprint('reviews', __name__)

# Get all reviews for a specific trail
@review_routes.route('/trails/<int:trail_id>/reviews')
def get_trail_reviews(trail_id):

    trail = Trail.query.get(trail_id)

    if not trail:
        return {'message': 'Trail not found'}, 404

    # This is to get query parameters
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)
    sort = request.args.get('sort', 'newest')

    # Build query
    query = Review.query.filter_by(trail_id=trail_id)

    # Then, apply sorting
    if sort == 'newest':
        query = query.order_by(Review.created_at.desc())
    elif sort == 'oldest':
        query = query.order_by(Review.created_at.asc())
    elif sort == 'highest':
        query = query.order_by(Review.rating.desc())
    elif sort == 'lowest':
        query = query.order_by(Review.rating.asc())

    # Paginate
    reviews = query.paginate(page=page, per_page=limit, error_out=False)

    return {
        'reviews': [review.to_dict() for review in reviews.items],
        'trail': {
            'id': trail.id,
            'name': trail.name
        },
        'pagination': {
            'page': reviews.page,
            'pages': reviews.pages,
            'per_page': reviews.per_page,
            'total': reviews.total
        }
    }

# Get detailed information about a specific review
@review_routes.route('/reviews/<int:id>')
def get_review_by_id(id):

    review = Review.query.get(id)

    if not review:
        return {'message': 'Review not found'}, 404

    return review.to_dict()

# Create a new review for a trail
@review_routes.route('/trails/<int:trail_id>/reviews', methods=['POST'])
@login_required
def create_review(trail_id):

    trail = Trail.query.get(trail_id)

    if not trail:
        return {'message': 'Trail not found'}, 404

    # Check if user already reviewed this trail
    existing_review = Review.query.filter_by(
        trail_id=trail_id,
        user_id=current_user.id
    ).first()

    if existing_review:
        return {'message': 'You have already reviewed this trail'}, 409

    data = request.get_json()

    # Create review instance for validation
    review = Review(
        trail_id=trail_id,
        user_id=current_user.id,
        rating=data.get('rating'),
        title=data.get('title', ''),
        content=data.get('content', ''),
        weather_condition=data.get('weather_condition'),
        trail_condition=data.get('trail_condition'),
        crowd_level=data.get('crowd_level')
    )

    # Parse hiked_date
    if data.get('hiked_date'):
        try:
            review.hiked_date = datetime.strptime(data['hiked_date'], '%Y-%m-%d').date()
        except ValueError:
            return {'message': 'Invalid date format. Use YYYY-MM-DD'}, 400

    # Validate
    errors = review.validate()
    if errors:
        return {'message': 'Validation error', 'errors': errors}, 400

    try:
        db.session.add(review)
        db.session.commit()

        # Update trail rating stats
        trail.update_rating_stats()

        return review.to_dict(), 201

    except IntegrityError:
        db.session.rollback()
        return {'message': 'You have already reviewed this trail'}, 409
    except Exception as e:
        db.session.rollback()
        return {'message': f'Error creating review: {str(e)}'}, 500

# Update an existing review
@review_routes.route('/reviews/<int:id>', methods=['PUT'])
@login_required
def update_review(id):

    review = Review.query.get(id)

    if not review:
        return {'message': 'Review not found'}, 404

    # Check permission
    if review.user_id != current_user.id:
        return {'message': 'Access denied. You can only edit your own reviews.'}, 403

    data = request.get_json()

    # Update fields
    if 'rating' in data:
        review.rating = data['rating']
    if 'title' in data:
        review.title = data['title']
    if 'content' in data:
        review.content = data['content']
    if 'weather_condition' in data:
        review.weather_condition = data['weather_condition']
    if 'trail_condition' in data:
        review.trail_condition = data['trail_condition']
    if 'crowd_level' in data:
        review.crowd_level = data['crowd_level']

    # Handle hiked_date update
    if 'hiked_date' in data:
        try:
            review.hiked_date = datetime.strptime(data['hiked_date'], '%Y-%m-%d').date()
        except ValueError:
            return {'message': 'Invalid date format. Use YYYY-MM-DD'}, 400

    # Validate
    errors = review.validate()
    if errors:
        return {'message': 'Validation error', 'errors': errors}, 400

    try:
        db.session.commit()

        # Update trail rating stats
        review.trail.update_rating_stats()

        return review.to_dict()

    except Exception as e:
        db.session.rollback()
        return {'message': f'Error updating review: {str(e)}'}, 500

# Delete a review
@review_routes.route('/reviews/<int:id>', methods=['DELETE'])
@login_required
def delete_review(id):

    review = Review.query.get(id)

    if not review:
        return {'message': 'Review not found'}, 404

    # Check permission
    if review.user_id != current_user.id and not current_user.is_admin:
        return {'message': 'Access denied. You can only delete your own reviews.'}, 403

    trail = review.trail

    try:
        db.session.delete(review)
        db.session.commit()

        # Update trail rating stats
        trail.update_rating_stats()

        return '', 204
    except Exception as e:
        db.session.rollback()
        return {'message': f'Error deleting review: {str(e)}'}, 500

# Get all reviews by a specific user
@review_routes.route('/users/<int:user_id>/reviews')
def get_user_reviews(user_id):

    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 10, type=int)

    reviews = Review.query.filter_by(user_id=user_id)\
        .order_by(Review.created_at.desc())\
        .paginate(page=page, per_page=limit, error_out=False)

    return {
        'reviews': [review.to_dict() for review in reviews.items],
        'pagination': {
            'page': reviews.page,
            'pages': reviews.pages,
            'per_page': reviews.per_page,
            'total': reviews.total
        }
    }
