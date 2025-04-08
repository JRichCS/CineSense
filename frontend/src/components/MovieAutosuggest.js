import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Component to display movie autosuggestions
const MovieAutosuggest = ({ onMovieSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  // Handle input change and update query
  const handleInputChange = (e) => {
    const { value } = e.target;
    setQuery(value);
  };

  // Fetch movie suggestions when the query changes
  useEffect(() => {
    if (query.length > 2) { // Trigger search after 3 characters
      setLoading(true);

      // Fetch movie suggestions from your backend
      axios.get(`http://localhost:8081/search?q=${query}`)
        .then((response) => {
          setSuggestions(response.data); // Update suggestions with response
        })
        .catch((error) => {
          console.error('Error fetching suggestions:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setSuggestions([]); // Clear suggestions if the query is too short
    }
  }, [query]);

  return (
    <div className="autosuggest-container">
      <input
        type="text"
        placeholder="Enter IMDb ID or part of it"
        value={query}
        onChange={handleInputChange}
        className="movie-input"
      />
      {loading && <p>Loading...</p>}
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((movie) => (
            <li
              key={movie.imdbId}
              onClick={() => onMovieSelect(movie)} // Trigger when a movie is selected
              className="suggestion-item"
            >
              {movie.title} (ID: {movie.imdbId})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MovieAutosuggest;
