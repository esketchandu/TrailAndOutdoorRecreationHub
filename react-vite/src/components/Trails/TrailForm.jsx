import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createTrail } from '../../redux/trails';
import './TrailForm.css';

function TrailForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    difficulty: 'easy',
    length_km: '',
    elevation_gain_m: '',
    region: '',
    parking_info: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
  const { name, value } = e.target;

  // Convert numeric fields to numbers
  let processedValue = value;
  if (name === 'length_km' || name === 'elevation_gain_m') {
    processedValue = value ? parseFloat(value) : '';
  }

  setFormData(prev => ({
    ...prev,
    [name]: processedValue
  }));

  // Clear error for this field when user starts typing
  if (errors[name]) {
    setErrors(prev => ({
      ...prev,
      [name]: ''
    }));
  }
};

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Trail name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.length_km || formData.length_km <= 0) {
      newErrors.length_km = 'Length must be greater than 0';
    }
    if (!formData.elevation_gain_m || formData.elevation_gain_m < 0) {
      newErrors.elevation_gain_m = 'Elevation gain cannot be negative';
    }
    if (!formData.region.trim()) {
      newErrors.region = 'Region is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    const result = await dispatch(createTrail(formData));

    if (result.errors) {
      setErrors(result.errors);
      setIsSubmitting(false);
    } else {
      // Navigate to the new trail's detail page
      navigate(`/trails/${result.id}`);
    }
  };

  return (
    <div className="trail-form-container">
      <div className="trail-form-header">
        <h1>Create New Trail</h1>
        <p>Share your favorite trail with the community</p>
      </div>

      <form onSubmit={handleSubmit} className="trail-form">
        <div className="form-group">
          <label htmlFor="name">Trail Name *</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., Eagle Peak Trail"
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the trail, scenery, notable features..."
            rows="4"
            className={errors.description ? 'error' : ''}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="difficulty">Difficulty *</label>
            <select
              id="difficulty"
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
            >
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="length_km">Length (km) *</label>
            <input
              id="length_km"
              name="length_km"
              type="number"
              step="0.1"
              value={formData.length_km}
              onChange={handleChange}
              placeholder="e.g., 5.5"
              className={errors.length_km ? 'error' : ''}
            />
            {errors.length_km && <span className="error-message">{errors.length_km}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="elevation_gain_m">Elevation Gain (m) *</label>
            <input
              id="elevation_gain_m"
              name="elevation_gain_m"
              type="number"
              value={formData.elevation_gain_m}
              onChange={handleChange}
              placeholder="e.g., 300"
              className={errors.elevation_gain_m ? 'error' : ''}
            />
            {errors.elevation_gain_m && <span className="error-message">{errors.elevation_gain_m}</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="region">Region *</label>
          <input
            id="region"
            name="region"
            type="text"
            value={formData.region}
            onChange={handleChange}
            placeholder="e.g., Yosemite Valley"
            className={errors.region ? 'error' : ''}
          />
          {errors.region && <span className="error-message">{errors.region}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="parking_info">Parking Information</label>
          <textarea
            id="parking_info"
            name="parking_info"
            value={formData.parking_info}
            onChange={handleChange}
            placeholder="Describe parking availability, fees, tips..."
            rows="3"
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={() => navigate('/trails')}
            className="cancel-button"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Trail'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default TrailForm;
