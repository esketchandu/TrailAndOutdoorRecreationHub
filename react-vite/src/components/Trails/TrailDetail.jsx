import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrailById, deleteTrail } from '../../redux/trails';
import ReviewList from '../Reviews/ReviewList';
import './TrailDetail.css';

function TrailDetail() {
  const { trailId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const trail = useSelector(state => state.trails.currentTrail);
  const currentUser = useSelector(state => state.session.user);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchTrailById(trailId))
      .then(() => setIsLoading(false))
      .catch(() => {
        setIsLoading(false);
        navigate('/trails');
      });
  }, [dispatch, trailId, navigate]);

  const handleEdit = () => {
    navigate(`/trails/${trailId}/edit`);
  };

  const handleDelete = async () => {
    const result = await dispatch(deleteTrail(trailId));
    if (result.message === "Successfully deleted") {
      navigate('/trails');
    }
  };

  // Function to get trail image
  const getTrailImage = (trailId) => {
    const imageNumber = (trailId % 5) + 1;
    return `/trail-images/trail-${imageNumber}.jpg`;
  };

  if (isLoading) return <div className="loading">Loading trail details...</div>;
  if (!trail) return <div className="error">Trail not found</div>;

  const difficultyClass = trail.difficulty.toLowerCase();
  const isOwner = currentUser && currentUser.id === trail.created_by;

  return (
    <div className="trail-detail">
      <div className="trail-header-section">
        <button className="back-button" onClick={() => navigate('/trails')}>
          ← Back to Trails
        </button>

        {isOwner && (
          <div className="trail-actions">
            <button className="edit-button" onClick={handleEdit}>
              Edit Trail
            </button>
            <button
              className="delete-button"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Trail
            </button>
          </div>
        )}
      </div>

      <div className="trail-header">
        <h1>{trail.name}</h1>
        <div className="trail-stats">
          <span className={`difficulty ${difficultyClass}`}>
            {trail.difficulty}
          </span>
          <span className="length">{trail.length_km} km</span>
          <span className="elevation">↗ {trail.elevation_gain_m}m</span>
        </div>
      </div>

      <div className="trail-image">
        <img
          src={getTrailImage(trail.id)}
          alt={trail.name}
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/trail-images/default-trail.jpg';
          }}
        />
      </div>

      <div className="trail-info">
        <div className="info-section">
          <h2>Description</h2>
          <p>{trail.description}</p>
        </div>

        <div className="info-section">
          <h2>Trail Information</h2>
          <div className="info-grid">
            <div className="info-item">
              <strong>Region:</strong> {trail.region}
            </div>
            <div className="info-item">
              <strong>Length:</strong> {trail.length_km} km
            </div>
            <div className="info-item">
              <strong>Elevation Gain:</strong> {trail.elevation_gain_m} meters
            </div>
            <div className="info-item">
              <strong>Difficulty:</strong> {trail.difficulty}
            </div>
            <div className="info-item">
              <strong>Rating:</strong> ⭐ {trail.avg_rating ? trail.avg_rating.toFixed(1) : 'No ratings yet'}
              {' '}
              ({trail.total_reviews || 0} reviews)
            </div>
          </div>
        </div>

        {trail.parking_info && (
          <div className="info-section">
            <h2>Parking Information</h2>
            <p>{trail.parking_info}</p>
          </div>
        )}

        <ReviewList trailId={trailId} />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="modal-backdrop" onClick={() => setShowDeleteModal(false)}>
          <div className="delete-modal" onClick={e => e.stopPropagation()}>
            <h2>Delete Trail</h2>
            <p>Are you sure you want to delete &quot;{trail.name}&quot;?</p>
            <p>This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="cancel-button"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="confirm-delete-button"
                onClick={handleDelete}
              >
                Delete Trail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrailDetail;
