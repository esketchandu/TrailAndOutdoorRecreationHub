// These are the action types
const SET_TRAILS = 'trails/SET_TRAILS';
const SET_TRAIL = 'trails/SET_TRAIL';
const ADD_TRAIL = 'trails/ADD_TRAIL';
const UPDATE_TRAIL = 'trails/UPDATE_TRAIL';
const REMOVE_TRAIL = 'trails/REMOVE_TRAIL';

// These are the action creators
const setTrails = (trails) => ({
  type: SET_TRAILS,
  payload: trails
});

const setTrail = (trail) => ({
  type: SET_TRAIL,
  payload: trail
});

const addTrail = (trail) => ({
  type: ADD_TRAIL,
  payload: trail
});

const updateTrail = (trail) => ({
  type: UPDATE_TRAIL,
  payload: trail
});

const removeTrail = (trailId) => ({
  type: REMOVE_TRAIL,
  payload: trailId
});

// These are the thunks
export const fetchTrails = (filters = {}) => async (dispatch) => {
  const queryParams = new URLSearchParams(filters).toString();
  const response = await fetch(`/api/trails?${queryParams}`);

  if (response.ok) {
    const data = await response.json();
    dispatch(setTrails(data.trails));
    return data;
  }
};

export const fetchTrailById = (trailId) => async (dispatch) => {
  const response = await fetch(`/api/trails/${trailId}`);

  if (response.ok) {
    const data = await response.json();
    dispatch(setTrail(data));
    return data;
  }
};

export const createTrail = (trailData) => async (dispatch) => {
  const response = await fetch('/api/trails', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trailData)
  });


  if (response.ok) {
    const data = await response.json();
    dispatch(addTrail(data));
    return data;
  } else if (response.status < 500) {
    const errorMessages = await response.json();
    return errorMessages;
  } else {
    return { server: "Something went wrong. Please try again" };
  }
};

export const updateTrailThunk = (trailId, trailData) => async (dispatch) => {
  const response = await fetch(`/api/trails/${trailId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trailData)
  });

  if (response.ok) {
    const data = await response.json();
    dispatch(updateTrail(data));
    return data;
  } else if (response.status < 500) {
    const errorMessages = await response.json();
    return errorMessages;
  } else {
    return { server: "Something went wrong. Please try again" };
  }
};

export const deleteTrail = (trailId) => async (dispatch) => {
  const response = await fetch(`/api/trails/${trailId}`, {
    method: 'DELETE'
  });

  if (response.ok) {
    dispatch(removeTrail(trailId));
    return { message: "Successfully deleted" };
  }
};

// This is the reducer
const initialState = {
  allTrails: {},
  currentTrail: null
};

export default function trailsReducer(state = initialState, action) {
  switch (action.type) {
    case SET_TRAILS: {
      const allTrails = {};
      action.payload.forEach(trail => {
        allTrails[trail.id] = trail;
      });
      return { ...state, allTrails };
    }
    case SET_TRAIL:
      return { ...state, currentTrail: action.payload };
    case ADD_TRAIL:
      return {
        ...state,
        allTrails: { ...state.allTrails, [action.payload.id]: action.payload }
      };
    case UPDATE_TRAIL:
      return {
        ...state,
        allTrails: { ...state.allTrails, [action.payload.id]: action.payload },
        currentTrail: state.currentTrail?.id === action.payload.id ? action.payload : state.currentTrail
      };
    case REMOVE_TRAIL: {
      const newTrails = { ...state.allTrails };
      delete newTrails[action.payload];
      return {
        ...state,
        allTrails: newTrails,
        currentTrail: state.currentTrail?.id === action.payload ? null : state.currentTrail
      };
    }
    default:
      return state;
  }
}
