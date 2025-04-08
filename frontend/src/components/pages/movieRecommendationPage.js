import React, { useState } from 'react';
import MovieAutosuggest from '../MovieAutosuggest';
import axios from 'axios';

const MovieRecommendationPage = () => {
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMovieSelect = (movie) => {
    setSelectedMovie(movie);
    fetchRecommendations(movie.title); // use movie.title or movie.imdbId based on backend
  };

  const fetchRecommendations = async (movieName) => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:8081/recommend', {
        movie_name: movieName,
      });

      // Assuming the API response structure contains a "recommendations" array
      const recommendedMovies = response.data.recommendations;

      // Set the state with the recommended movies
      setRecommendations(recommendedMovies);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to get recommendations');
    } finally {
      setLoading(false);
    }
  };

  // 🎯 Center the content using inline style
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: '100vh',
    padding: '2rem',
    backgroundColor: '#f5f5f5',
    fontFamily: 'sans-serif',
  };

  const listStyle = {
    listStyleType: 'none',
    padding: 0,
    textAlign: 'left',
  };

  return (
    <div style={containerStyle}>
      <h2>Get Movie Recommendations</h2>

      <MovieAutosuggest onMovieSelect={handleMovieSelect} />

      {selectedMovie && <h3>Selected Movie: {selectedMovie.title}</h3>}

      {loading && <p>Loading recommendations...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {recommendations.length > 0 && (
        <div>
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
