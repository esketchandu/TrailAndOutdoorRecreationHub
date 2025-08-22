from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from app.models import db, Trail, Review
from sqlalchemy import func
from geoalchemy2.shape import from_shape
from shapely.geometry import LineString, Point
import json

trail_routes = Blueprint('trails', __name__)

# Get all trails with optional filtering
# Get query parameters

@trail_routes.route('')
def get_all_trails():
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)
    difficulty = request.args.get('difficulty')
    min_length = request.args.get('min_length', type=float)
    max_length = request.args.get('max_length', type=float)
    region = request.args.get('region')

    # This is to build query
    query = Trail.query

    # Then apply filters
    if difficulty:
        query = query.filter(Trail.difficulty == difficulty)
    if min_length:
        query = query.filter(Trail.length_km >= min_length)
    if max_length:
        query = query.filter(Trail.length_km <= max_length)
    if region:
        query = query.filter(Trail.region.ilike(f'%{region}%'))

    # Paginate
    trails = query.paginate(page=page, per_page=limit, error_out=False)

    return {
        'trails': [trail.to_dict_basic() for trail in trails.items],
        'pagination': {
            'page': trails.page,
            'pages': trails.pages,
            'per_page': trails.per_page,
            'total': trails.total
        }
    }

#Get detailed information about a specific trail
@trail_routes.route('/<int:id>')
def get_trail_by_id(id):

    trail = Trail.query.get(id)

    if not trail:
        return {'message': 'Trail not found'}, 404

    return trail.to_dict()

# Create a new trail
@trail_routes.route('', methods=['POST'])
@login_required
def create_trail():
    data = request.get_json()


    # Validate required fields
    errors = {}
    if not data.get('name'):
        errors['name'] = 'Trail name is required'
    if not data.get('difficulty'):
        errors['difficulty'] = 'Difficulty is required'
    elif data['difficulty'] not in ['easy', 'moderate', 'hard', 'expert']:
        errors['difficulty'] = 'Difficulty must be one of: easy, moderate, hard, expert'

    # Convert and validate length_km
    length_km = None
    if not data.get('length_km'):
        errors['length_km'] = 'Trail length is required'
    else:
        try:
            length_km = float(data.get('length_km'))
            if length_km <= 0:
                errors['length_km'] = 'Trail length must be a positive number'
        except (ValueError, TypeError):
            errors['length_km'] = 'Trail length must be a valid number'

    # Convert and validate elevation_gain_m (optional field)
    elevation_gain_m = None
    if data.get('elevation_gain_m'):
        try:
            elevation_gain_m = float(data.get('elevation_gain_m'))
            if elevation_gain_m < 0:
                errors['elevation_gain_m'] = 'Elevation gain cannot be negative'
        except (ValueError, TypeError):
            errors['elevation_gain_m'] = 'Elevation gain must be a valid number'

    if errors:
        return {'message': 'Validation error', 'errors': errors}, 400

    try:
        # Handle geometry if provided, otherwise create a default line
        geometry = None
        if data.get('geometry'):  # Check if geometry exists first
            geojson = data['geometry']
            if geojson['type'] != 'LineString':
                return {'message': 'Geometry must be a LineString'}, 400
            # This is to create LineString from coordinates
            line = LineString(geojson['coordinates'])
            geometry = from_shape(line, srid=4326)
        else:
            # Create a default line (just two points)
            # This is a temporary solution until we implement map functionality
            default_line = LineString([(0, 0), (0.001, 0.001)])
            geometry = from_shape(default_line, srid=4326)

        # Then create trail
        trail = Trail(
            name=data['name'],
            description=data.get('description', ''),
            difficulty=data['difficulty'],
            length_km=length_km,  # Already converted to float
            elevation_gain_m=elevation_gain_m,  # Already converted to float or None
            geometry=geometry,  # Now always has a value
            region=data.get('region', ''),
            parking_info=data.get('parking_info', ''),
            created_by=current_user.id
        )


        db.session.add(trail)
        db.session.commit()


        return trail.to_dict(), 201

    except Exception as e:
        db.session.rollback()
        return {'message': f'Error creating trail: {str(e)}'}, 500

# Update an existing trail
@trail_routes.route('/<int:id>', methods=['PUT'])
@login_required
def update_trail(id):

    trail = Trail.query.get(id)

    if not trail:
        return {'message': 'Trail not found'}, 404

    # This is to Check permission
    if trail.created_by != current_user.id and not current_user.is_admin:
        return {'message': 'Access denied. You can only edit trails you created.'}, 403

    data = request.get_json()

    # This is to Validate fields if provided
    errors = {}
    if 'difficulty' in data and data['difficulty'] not in ['easy', 'moderate', 'hard', 'expert']:
        errors['difficulty'] = 'Difficulty must be one of: easy, moderate, hard, expert'
    if 'length_km' in data and data['length_km'] <= 0:
        errors['length_km'] = 'Trail length must be a positive number'

    if errors:
        return {'message': 'Validation error', 'errors': errors}, 400

    try:
        # Update fields
        if 'name' in data:
            trail.name = data['name']
        if 'description' in data:
            trail.description = data['description']
        if 'difficulty' in data:
            trail.difficulty = data['difficulty']
        if 'length_km' in data:
            trail.length_km = data['length_km']
        if 'elevation_gain_m' in data:
            trail.elevation_gain_m = data['elevation_gain_m']
        if 'region' in data:
            trail.region = data['region']
        if 'parking_info' in data:
            trail.parking_info = data['parking_info']

        # Handle geometry update if provided
        if 'geometry' in data:
            geojson = data['geometry']
            if geojson['type'] != 'LineString':
                return {'message': 'Geometry must be a LineString'}, 400
            line = LineString(geojson['coordinates'])
            trail.geometry = from_shape(line, srid=4326)

        db.session.commit()
        return trail.to_dict()

    except Exception as e:
        db.session.rollback()
        return {'message': f'Error updating trail: {str(e)}'}, 500

# Delete a trail
@trail_routes.route('/<int:id>', methods=['DELETE'])
@login_required
def delete_trail(id):

    trail = Trail.query.get(id)

    if not trail:
        return {'message': 'Trail not found'}, 404

    # This is to check permission
    if trail.created_by != current_user.id and not current_user.is_admin:
        return {'message': 'Access denied. You can only delete trails you created.'}, 403

    try:
        db.session.delete(trail)
        db.session.commit()
        return '', 204
    except Exception as e:
        db.session.rollback()
        return {'message': f'Error deleting trail: {str(e)}'}, 500

# Search trails by name or region
@trail_routes.route('/search')
def search_trails():

    query = request.args.get('q', '')
    page = request.args.get('page', 1, type=int)
    limit = request.args.get('limit', 20, type=int)

    if not query:
        return {'message': 'Search query is required'}, 400

    # Search in name and region
    trails = Trail.query.filter(
        db.or_(
            Trail.name.ilike(f'%{query}%'),
            Trail.region.ilike(f'%{query}%')
        )
    ).paginate(page=page, per_page=limit, error_out=False)

    return {
        'trails': [trail.to_dict_basic() for trail in trails.items],
        'search_query': query,
        'pagination': {
            'page': trails.page,
            'pages': trails.pages,
            'per_page': trails.per_page,
            'total': trails.total
        }
    }
