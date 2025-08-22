import { useState } from 'react';
import './StarRating.css';

function StarRating({ rating, onRatingChange, readOnly = false }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating">
      {[...Array(5)].map((_, index) => {
        const ratingValue = index + 1;
        return (
          <button
            key={index}
            type="button"
            className={`star ${ratingValue <= (hover || rating) ? 'filled' : ''}`}
            onClick={() => !readOnly && onRatingChange(ratingValue)}
            onMouseEnter={() => !readOnly && setHover(ratingValue)}
            onMouseLeave={() => !readOnly && setHover(0)}
            disabled={readOnly}
          >
            ⭐
          </button>
        );
      })}
    </div>
  );
}

export default StarRating;
