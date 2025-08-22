// Action types
const SET_REVIEWS = 'reviews/SET_REVIEWS';
const ADD_REVIEW = 'reviews/ADD_REVIEW';
const UPDATE_REVIEW = 'reviews/UPDATE_REVIEW';
const REMOVE_REVIEW = 'reviews/REMOVE_REVIEW';

// Action creators
const setReviews = (reviews) => ({
  type: SET_REVIEWS,
  payload: reviews
});

const addReview = (review) => ({
  type: ADD_REVIEW,
  payload: review
});

const updateReview = (review) => ({
  type: UPDATE_REVIEW,
  payload: review
});

const removeReview = (reviewId) => ({
  type: REMOVE_REVIEW,
  payload: reviewId
});

// Thunks
export const fetchReviewsByTrailId = (trailId) => async (dispatch) => {
  const response = await fetch(`/api/trails/${trailId}/reviews`);

  if (response.ok) {
    const data = await response.json();
    dispatch(setReviews(data.reviews));
    return data;
  }
};

export const createReview = (trailId, reviewData) => async (dispatch) => {
  const response = await fetch(`/api/trails/${trailId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(addReview(data));
    return data;
  } else if (response.status < 500) {
    const errorMessages = await response.json();
    return { errors: errorMessages };
  } else {
    return { errors: { server: "Something went wrong. Please try again" } };
  }
};

export const updateReviewThunk = (reviewId, reviewData) => async (dispatch) => {
  const response = await fetch(`/api/reviews/${reviewId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(reviewData)
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(updateReview(data));
    return data;
  } else if (response.status < 500) {
    const errorMessages = await response.json();
    return { errors: errorMessages };
  } else {
    return { errors: { server: "Something went wrong. Please try again" } };
  }
};

export const deleteReview = (reviewId) => async (dispatch) => {
  const response = await fetch(`/api/reviews/${reviewId}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    dispatch(removeReview(reviewId));
    return { message: "Successfully deleted" };
  }
};

// Reducer
const initialState = {
  trailReviews: {}
};

export default function reviewsReducer(state = initialState, action) {
  switch (action.type) {
    case SET_REVIEWS: {
      const trailReviews = {};
      action.payload.forEach(review => {
        trailReviews[review.id] = review;
      });
      return { ...state, trailReviews };
    }
    case ADD_REVIEW:
      return {
        ...state,
        trailReviews: { ...state.trailReviews, [action.payload.id]: action.payload }
      };
    case UPDATE_REVIEW:
      return {
        ...state,
        trailReviews: { ...state.trailReviews, [action.payload.id]: action.payload }
      };
    case REMOVE_REVIEW: {
      const newReviews = { ...state.trailReviews };
      delete newReviews[action.payload];
      return { ...state, trailReviews: newReviews };
    }
    default:
      return state;
  }
}
