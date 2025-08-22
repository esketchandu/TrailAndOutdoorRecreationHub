import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTrails } from '../../redux/trails';
import TrailCard from './TrailCard';
import './TrailList.css';

function TrailList() {
  const dispatch = useDispatch();
  // Fix the selector warning
  const trails = useSelector(state => state.trails.allTrails);
  const trailsArray = useMemo(() => Object.values(trails || {}), [trails]);

  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: '',
    region: ''
  });

  useEffect(() => {
    dispatch(fetchTrails(filters))
      .then(() => setIsLoading(false));
  }, [dispatch, filters]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  if (isLoading) return <div className="loading">Loading trails...</div>;

  return (
    <div className="trails-page">
      <h1>Explore Trails</h1>

      <div className="filters">
        <select
          value={filters.difficulty}
          onChange={(e) => handleFilterChange('difficulty', e.target.value)}
        >
          <option value="">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="hard">Hard</option>
        </select>

        <select
          value={filters.region}
          onChange={(e) => handleFilterChange('region', e.target.value)}
        >
          <option value="">All Regions</option>
          <option value="Yosemite Valley">Yosemite Valley</option>
          <option value="Sierra Nevada Foothills">Sierra Nevada Foothills</option>
          <option value="Test Region">Test Region</option>
        </select>
      </div>

      <div className="trails-grid">
        {trailsArray.length > 0 ? (
          trailsArray.map(trail => (
            <TrailCard key={trail.id} trail={trail} />
          ))
        ) : (
          <p>No trails found.</p>
        )}
      </div>
    </div>
  );
}

export default TrailList;
