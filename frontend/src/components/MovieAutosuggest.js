import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w92';

const MovieAutosuggest = ({ onMovieSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { value } = e.target;
    setQuery(value);
  };

  useEffect(() => {
    if (query.length > 2) {
      setLoading(true);

      axios.get(`http://localhost:8081/search?q=${query}`)
        .then((response) => {
          setSuggestions(response.data);
          console.log(response.data);
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
    <div className="relative w-full max-w-md mb-6">
      <input
        type="text"
        placeholder="Search for a movie..."
        value={query}
        onChange={handleInputChange}
        className="w-full px-4 py-2 rounded-xl border border-[#383531] focus:outline-none focus:ring-2 focus:ring-[#FCC705] focus:border-transparent shadow-md bg-[#2a2928] text-white placeholder-[#FCC705]"
      />
      {loading && (
        <p className="text-sm text-gray-400 mt-1">Searching...</p>
      )}
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full mt-2 bg-[#1c1b1a] border border-[#383531] rounded-xl shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((movie) => (
            <li
              key={movie.imdbId}
              onClick={() => {
                onMovieSelect(movie);
                setQuery('');
                setSuggestions([]);
              }}
              className="w-full cursor-pointer hover:bg-[#d4a807] hover:text-black transition duration-150 ease-in-out"
            >
              <div className="flex items-center gap-3 px-4 py-2">
                {movie.posterPath ? (
                  <img
                    src={`${TMDB_IMAGE_BASE}${movie.posterPath}`}
                    alt={`${movie.primaryTitle} Poster`}
                    className="w-10 h-auto rounded"
                  />
                ) : (
                  <div className="w-10 h-14 bg-gray-200 rounded flex items-center justify-center text-gray-500 text-xs">
                    N/A
                  </div>
                )}
                <span className="text-sm text-white">
                  {movie.primaryTitle}{' '}
                  <span className="text-gray-400">({movie.releaseYear})</span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MovieAutosuggest;
