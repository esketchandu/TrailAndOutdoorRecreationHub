import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createReview } from '../../redux/reviews';
import StarRating from './StarRating';
import './ReviewForm.css';

function ReviewForm({ trailId, onClose }) {
  const dispatch = useDispatch();
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState('');
  const [hikedDate, setHikedDate] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    if (!rating) {
      newErrors.rating = 'Please select a rating';
    }
    if (!content.trim()) {
      newErrors.content = 'Please write a review';
    }
    if (!hikedDate) {
      newErrors.hiked_date = 'Please select when you hiked this trail';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    const reviewData = {
      rating,
      content,
      title: '',
      hiked_date: hikedDate
    };

    const result = await dispatch(createReview(trailId, reviewData));

    if (result.errors) {
      setErrors(result.errors.errors || result.errors); // This is to handle nested errors
      setIsSubmitting(false);
    } else {
      onClose();
    }
  };

  // Get today's date in YYYY-MM-DD format for max date
  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="review-form">
      <h3>Write Your Review</h3>

      <div className="form-group">
        <label>Rating</label>
        <StarRating rating={rating} onRatingChange={setRating} />
        {errors.rating && <span className="error-message">{errors.rating}</span>}
      </div>

      <div className="form-group">
        <label>When did you hike this trail?</label>
        <input
          type="date"
          value={hikedDate}
          onChange={(e) => setHikedDate(e.target.value)}
          max={today}
          className={errors.hiked_date ? 'error' : ''}
        />
        {errors.hiked_date && <span className="error-message">{errors.hiked_date}</span>}
      </div>

      <div className="form-group">
        <label>Your Review</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your experience on this trail..."
          rows="4"
          className={errors.content ? 'error' : ''}
        />
        {errors.content && <span className="error-message">{errors.content}</span>}
      </div>

      <div className="form-actions">
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
        <button type="button" onClick={onClose} className="cancel-button">
          Cancel
        </button>
      </div>
    </form>
  );
}

export default ReviewForm;
