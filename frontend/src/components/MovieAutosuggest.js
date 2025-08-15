import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaSearch, FaSpinner, FaTimes } from 'react-icons/fa';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

const MovieAutosuggest = ({ onMovieSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { value } = e.target;
    setQuery(value);
  };

  const clearSearch = () => {
    setQuery('');
    setSuggestions([]);
  };

  useEffect(() => {
    if (query.length > 2) {
      setLoading(true);

      axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URI}/search?q=${query}`)
        .then((response) => {
          setSuggestions(response.data);
        })
        .catch((error) => {
          console.error('Error fetching suggestions:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setSuggestions([]);
    }
  }, [query]);

  return (
    <div className="relative w-full">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FaSearch className="h-5 w-5 text-cine-text-secondary" />
        </div>
        <input
          type="text"
          placeholder="Search for movies"
          value={query}
          onChange={handleInputChange}
          className="cine-input pl-12 pr-12 w-full text-lg"
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-cine-text-secondary hover:text-cine-gold transition-colors"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="absolute z-20 w-full mt-2 bg-cine-darker border border-cine-gray rounded-xl shadow-cine p-4">
          <div className="flex items-center justify-center space-x-3 text-cine-text-secondary">
            <FaSpinner className="h-5 w-5 animate-spin" />
            <span>Searching for movies...</span>
          </div>
        </div>
      )}

      {/* Search Suggestions */}
      {suggestions.length > 0 && (
        <div className="absolute z-20 w-full mt-2 bg-cine-darker border border-cine-gray rounded-xl shadow-cine max-h-80 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs text-cine-text-secondary px-3 py-2 border-b border-cine-gray">
              Found {suggestions.length} movie{suggestions.length !== 1 ? 's' : ''}
            </div>
            {suggestions.map((movie) => (
              <div
                key={movie.imdbId}
                onClick={() => {
                  onMovieSelect(movie);
                  clearSearch();
                }}
                className="flex items-center gap-4 px-3 py-3 rounded-lg cursor-pointer hover:bg-cine-gray transition-all duration-200 group"
              >
                {movie.posterPath ? (
                  <img
                    src={`${TMDB_IMAGE_BASE}${movie.posterPath}`}
                    alt={`${movie.primaryTitle} Poster`}
                    className="w-12 h-auto rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-200"
                  />
                ) : (
                  <div className="w-12 h-16 bg-cine-gray rounded-lg flex items-center justify-center text-cine-text-secondary text-xs border border-cine-light-gray">
                    N/A
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-cine-text font-medium group-hover:text-cine-gold transition-colors duration-200">
                    {movie.primaryTitle}
                  </div>
                  <div className="text-cine-text-secondary text-sm">
                    {movie.releaseYear}
                  </div>
                </div>
                <div className="text-cine-gold opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <FaSearch className="h-4 w-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Tips */}
      {!query && !loading && suggestions.length === 0 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center space-x-2 text-cine-text-secondary text-sm">
            <FaSearch className="h-4 w-4" />
            <span>Start typing to search for movies</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieAutosuggest;
