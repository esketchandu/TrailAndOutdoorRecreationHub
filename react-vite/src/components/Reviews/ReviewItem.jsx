import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { deleteReview, updateReviewThunk } from '../../redux/reviews';
import StarRating from './StarRating';
import './ReviewItem.css';

function ReviewItem({ review }) {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.session.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editedReview, setEditedReview] = useState({
    rating: review.rating,
    content: review.content,
    hiked_date: review.hiked_date ? review.hiked_date.split('T')[0] : ''
  });

  const isOwner = currentUser?.id === review.user_id;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      await dispatch(deleteReview(review.id));
    }
  };

  const handleUpdate = async () => {
    const result = await dispatch(updateReviewThunk(review.id, editedReview));
    if (!result.errors) {
      setIsEditing(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // This is to get today's date for max date validation
  const today = new Date().toISOString().split('T')[0];

  if (isEditing) {
    return (
      <div className="review-item editing">
        <StarRating
          rating={editedReview.rating}
          onRatingChange={(rating) => setEditedReview({...editedReview, rating})}
        />
        <label>
          When did you hike this trail?
          <input
            type="date"
            value={editedReview.hiked_date}
            onChange={(e) => setEditedReview({...editedReview, hiked_date: e.target.value})}
            max={today}
            required
          />
        </label>
        <textarea
          value={editedReview.content}
          onChange={(e) => setEditedReview({...editedReview, content: e.target.value})}
          rows="4"
          placeholder="Share your experience on this trail..."
        />
        <div className="edit-actions">
          <button onClick={handleUpdate} className="save-button">Save</button>
          <button onClick={() => setIsEditing(false)} className="cancel-button">Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div className="review-item">
      <div className="review-header">
        <div className="reviewer-info">
          <span className="reviewer-name">{review.user?.username || 'Anonymous'}</span>
          <span className="review-date">
            Reviewed on {formatDate(review.created_at)}
          </span>
          {review.hiked_date && (
            <span className="hiked-date">
              Hiked on {formatDate(review.hiked_date)}
            </span>
          )}
        </div>
        {isOwner && (
          <div className="review-actions">
            <button onClick={() => setIsEditing(true)} className="edit-button">Edit</button>
            <button onClick={handleDelete} className="delete-button">Delete</button>
          </div>
        )}
      </div>
      <StarRating rating={review.rating} readOnly />
      <p className="review-comment">{review.content}</p>
    </div>
  );
}

export default ReviewItem;
