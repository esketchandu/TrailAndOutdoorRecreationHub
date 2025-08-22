import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReviewsByTrailId } from '../../redux/reviews';
import ReviewItem from './ReviewItem';
import ReviewForm from './ReviewForm';
import './ReviewList.css';

function ReviewList({ trailId }) {
  const dispatch = useDispatch();
  const reviews = useSelector(state => state.reviews.trailReviews);
  const currentUser = useSelector(state => state.session.user);
  const reviewsArray = Object.values(reviews);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    dispatch(fetchReviewsByTrailId(trailId));
  }, [dispatch, trailId]);

  // Check if current user has already reviewed this trail
  const userReview = reviewsArray.find(review =>
    review.user_id === currentUser?.id
  );

  return (
    <div className="reviews-section">
      <div className="reviews-header">
        <h2>Reviews ({reviewsArray.length})</h2>
        {currentUser && !userReview && !showReviewForm && (
          <button
            className="write-review-button"
            onClick={() => setShowReviewForm(true)}
          >
            Write a Review
          </button>
        )}
      </div>

      {showReviewForm && (
        <ReviewForm
          trailId={trailId}
          onClose={() => setShowReviewForm(false)}
        />
      )}

      <div className="reviews-list">
        {reviewsArray.length > 0 ? (
          reviewsArray.map(review => (
            <ReviewItem key={review.id} review={review} />
          ))
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review this trail!</p>
        )}
      </div>
    </div>
  );
}

export default ReviewList;
