from app.models import db, Trail, Review, environment, SCHEMA
from geoalchemy2.shape import from_shape
from shapely.geometry import LineString
from datetime import datetime, timedelta
import random


def seed_trails():
    # This is sample trail coordinates simplified for demo
    eagle_peak_coords = [
        [-119.5383, 37.7459],
        [-119.5384, 37.7460],
        [-119.5385, 37.7461],
        [-119.5386, 37.7462],
        [-119.5387, 37.7463]
    ]

    river_loop_coords = [
        [-119.5200, 37.7300],
        [-119.5201, 37.7301],
        [-119.5202, 37.7302],
        [-119.5203, 37.7301],
        [-119.5200, 37.7300]  # Loop back to start
    ]

    sunset_ridge_coords = [
        [-119.5500, 37.7600],
        [-119.5501, 37.7601],
        [-119.5502, 37.7602],
        [-119.5503, 37.7603]
    ]

    # Create trails
    trail1 = Trail(
        name='Eagle Peak Trail',
        description='A challenging hike with stunning summit views. The trail starts at the valley floor and climbs steadily through pine forests before reaching alpine meadows.',
        difficulty='hard',
        length_km=12.5,
        elevation_gain_m=850,
        geometry=from_shape(LineString(eagle_peak_coords), srid=4326),
        region='Yosemite National Park',
        parking_info='Park at the Eagle Peak Trailhead parking lot. Arrives early on weekends as it fills up by 8 AM. $30 park entrance fee required.',
        created_by=1  # Demo user
    )

    trail2 = Trail(
        name='River Loop Trail',
        description='An easy family-friendly loop trail following the river. Great for wildflowers in spring and fall colors in autumn.',
        difficulty='easy',
        length_km=3.2,
        elevation_gain_m=50,
        geometry=from_shape(LineString(river_loop_coords), srid=4326),
        region='Yosemite Valley',
        parking_info='Free parking available at the visitor center. Short walk to trailhead.',
        created_by=2  # Marnie user
    )

    trail3 = Trail(
        name='Sunset Ridge Trail',
        description='Moderate trail with spectacular sunset views. Best hiked in late afternoon. Rocky sections require good footwear.',
        difficulty='moderate',
        length_km=6.8,
        elevation_gain_m=400,
        geometry=from_shape(LineString(sunset_ridge_coords), srid=4326),
        region='Sierra Nevada Foothills',
        parking_info='Small parking area at trailhead. No facilities available.',
        created_by=3  # Bobbie user
    )

    db.session.add_all([trail1, trail2, trail3])
    db.session.commit()

    # Create reviews
    reviews = [
        Review(
            trail_id=1,
            user_id=2,
            rating=5,
            title='Absolutely breathtaking!',
            content='This trail exceeded all expectations. The summit views were incredible and the wildflowers in the meadow section were amazing. Tough climb but so worth it!',
            hiked_date=datetime.now().date() - timedelta(days=5),
            weather_condition='sunny',
            trail_condition='excellent',
            crowd_level='moderate',
            helpful_count=15
        ),
        Review(
            trail_id=1,
            user_id=3,
            rating=4,
            title='Great hike but crowded',
            content='Beautiful trail with amazing views. The trail was well-maintained but quite crowded on Saturday morning. Recommend going early on weekdays. Bring plenty of water!',
            hiked_date=datetime.now().date() - timedelta(days=10),
            weather_condition='cloudy',
            trail_condition='good',
            crowd_level='crowded',
            helpful_count=8
        ),
        Review(
            trail_id=2,
            user_id=1,
            rating=5,
            title='Perfect family hike',
            content='Took the kids (ages 6 and 8) and they loved it! Easy trail with lots to see. We saw deer and lots of birds. The river is beautiful and there are several spots to stop for snacks.',
            hiked_date=datetime.now().date() - timedelta(days=2),
            weather_condition='sunny',
            trail_condition='excellent',
            crowd_level='light',
            helpful_count=12
        ),
        Review(
            trail_id=2,
            user_id=3,
            rating=4,
            title='Nice easy walk',
            content='Great trail for a relaxing walk. Not much elevation gain. The loop is well-marked. Some muddy spots near the river after recent rain.',
            hiked_date=datetime.now().date() - timedelta(days=15),
            weather_condition='rainy',
            trail_condition='muddy',
            crowd_level='empty',
            helpful_count=5
        ),
        Review(
            trail_id=3,
            user_id=1,
            rating=4,
            title='Beautiful sunset views',
            content='Started at 4 PM to catch the sunset and it was spectacular! The trail is rockier than expected, definitely need good hiking boots. Some exposure on the ridge.',
            hiked_date=datetime.now().date() - timedelta(days=7),
            weather_condition='sunny',
            trail_condition='good',
            crowd_level='light',
            helpful_count=10
        )
    ]

    db.session.add_all(reviews)
    db.session.commit()

    # Update trail ratings
    for trail in [trail1, trail2, trail3]:
        trail.update_rating_stats()


def undo_trails():
    if environment == "production":
        db.session.execute(f"TRUNCATE table {SCHEMA}.reviews RESTART IDENTITY CASCADE;")
        db.session.execute(f"TRUNCATE table {SCHEMA}.trails RESTART IDENTITY CASCADE;")
    else:
        db.session.execute("DELETE FROM reviews")
        db.session.execute("DELETE FROM trails")

    db.session.commit()
