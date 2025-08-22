import { useNavigate } from 'react-router-dom';
import './TrailCard.css';

function TrailCard({ trail }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/trails/${trail.id}`);
  };

  const difficultyClass = trail.difficulty.toLowerCase();

  // Function to get trail image
  const getTrailImage = (trailId) => {
    // Use modulo to cycle through available images
    const imageNumber = (trailId % 5) + 1;
    return `/trail-images/trail-${imageNumber}.jpg`;
  };

  return (
    <div className="trail-card" onClick={handleClick}>
      <div className="trail-card-image">
        <img
          src={getTrailImage(trail.id)}
          alt={trail.name}
          onError={(e) => {
            e.target.src = '/trail-images/default-trail.jpg';
          }}
        />
      </div>
      <div className="trail-card-content">
        <h3>{trail.name}</h3>
        <div className="trail-card-stats">
          <span className={`difficulty ${difficultyClass}`}>
            {trail.difficulty}
          </span>
          <span className="length">{trail.length_km} km</span>
          <span className="elevation">↗ {trail.elevation_gain_m}m</span>
        </div>
        <div className="trail-card-footer">
          <span className="rating">
            ⭐ {trail.avg_rating ? trail.avg_rating.toFixed(1) : 'No rating'}
          </span>
          <span className="region">{trail.region}</span>
        </div>
      </div>
    </div>
  );
}

export default TrailCard;
