import React, { useState } from 'react';
import MovieAutosuggest from '../MovieAutosuggest';
import axios from 'axios';

const MovieRecommendationPage = () => {
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 🎯 Add selected movie to list (if not already selected)
  const handleMovieSelect = (movie) => {
    if (!selectedMovies.some((m) => m.imdbId === movie.imdbId)) {
      setSelectedMovies((prev) => [...prev, movie]);
    }
  };

  // 🧹 Remove a selected movie (optional helper)
  const removeSelectedMovie = (imdbId) => {
    setSelectedMovies((prev) => prev.filter((movie) => movie.imdbId !== imdbId));
  };

  const fetchRecommendations = async () => {
    if (selectedMovies.length === 0) return;

    setLoading(true);
    setError('');
    setRecommendations([]);

    try {
      const response = await axios.post('http://localhost:8081/recommend', {
        movie_ids: selectedMovies.map((m) => m.imdbId),
      });

      setRecommendations(response.data.recommendations);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '2rem',
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    fontFamily: 'sans-serif',
  };

  const listStyle = {
    listStyleType: 'none',
    padding: 0,
    marginTop: '1rem',
  };

  const boxStyle = {
    background: '#fff',
    borderRadius: '8px',
    padding: '1rem',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '500px',
    marginBottom: '2rem',
  };

  return (
    <div style={containerStyle}>
      <h2>Get Movie Recommendations</h2>

      <MovieAutosuggest onMovieSelect={handleMovieSelect} />

      {/* Selected Movies Box */}
      {selectedMovies.length > 0 && (
        <div style={boxStyle}>
          <h3>Selected Movies</h3>
          <ul style={listStyle}>
            {selectedMovies.map((movie) => (
              <li key={movie.imdbId}>
                {movie.title}{' '}
                <button onClick={() => removeSelectedMovie(movie.imdbId)} style={{ marginLeft: '10px' }}>
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommend Button */}
      <button onClick={fetchRecommendations} disabled={loading || selectedMovies.length === 0}>
        {loading ? 'Loading...' : 'Get Recommendations'}
      </button>

      {/* Error message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Recommendations List */}
      {recommendations.length > 0 && (
        <div style={boxStyle}>
          <h3>Recommended Movies</h3>
          <ul style={listStyle}>
            {recommendations.map((movie, index) => (
              <li key={index}>{movie}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default MovieRecommendationPage;
