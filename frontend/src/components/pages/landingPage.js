import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import getUserInfo from '../../utilities/decodeJwt'; // Adjust the path to your utility function
import logo from '../../CineSense_Logo.png'; // Path to logo

const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

const LandingPage = () => {
  const [topMovies, setTopMovies] = useState([]);
  const [error, setError] = useState('');
  const containerRef = useRef();
  const navigate = useNavigate();

  const user = getUserInfo(); // Check if the user is logged in

  useEffect(() => {
    const fetchTopMovies = async () => {
      try {
        const response = await axios.get(`${TMDB_BASE_URL}/movie/top_rated`, {
          params: {
            api_key: TMDB_API_KEY,
            language: 'en-US',
            page: 1,
          },
        });

        setTopMovies(response.data.results.slice(0, 30));
      } catch (error) {
        console.error('Error fetching top movies:', error);
        setError('Failed to fetch movies. Please check your API key.');
      }
    };

    fetchTopMovies();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (containerRef.current) {
        const containerHeight = containerRef.current.offsetHeight;
        const scrollTop = containerRef.current.scrollTop;
        containerRef.current.scrollTop = scrollTop + (containerHeight / topMovies.length) * 0.9;

        if (scrollTop >= containerRef.current.scrollHeight - containerHeight) {
          containerRef.current.scrollTop = 0;
          appendNewPosters();
        }
      }
    }, 2);

    return () => clearInterval(interval);
  }, [topMovies]);

  const appendNewPosters = () => {
    setTopMovies((prevMovies) => [...prevMovies, ...prevMovies]);
  };

  const handleGetStarted = () => {
    if (user) {
      navigate('/recommend'); // If user is logged in, navigate to recommendation page
    } else {
      navigate('/login'); // If user is not logged in, navigate to login page
    }
  };

  const renderPosters = () => {
    const posters = [...topMovies, ...topMovies];
    return posters.map((movie, index) => (
      <div key={index} style={{ margin: 0 }}>
        <img
          src={`${TMDB_POSTER_BASE_URL}${movie.poster_path}`}
          alt={movie.title}
          style={{
            width: '100%',
            height: 'auto',
            objectFit: 'contain',
            display: 'block',
            marginBottom: 0,
          }}
        />
      </div>
    ));
  };

  return (
    <div style={{ height: '100vh', overflow: 'hidden', position: 'relative' }}>
      {error && <p style={{ color: 'red' }}>{error}</p>}

     
      <style>
        {`
          ::-webkit-scrollbar {
            display: none;
          }
        `}
      </style>

      {/* Logo */}
      <img
        src={logo}
        alt="CineSense Logo"
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          width: '500px',
          pointerEvents: 'none',
          opacity: 0.9,
        }}
      />

      {/* Get Started Button */}
      <button
        onClick={handleGetStarted}
        style={{
          position: 'absolute',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10,
          backgroundColor: '#ff5555',
          color: 'white',
          padding: '1rem 2rem',
          fontSize: '1.5rem',
          border: 'none',
          borderRadius: '0.5rem',
          cursor: 'pointer',
          boxShadow: '0 0 10px rgba(0,0,0,0.5)',
        }}
      >
        Get Started
      </button>

      {/* Vignette overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background: 'radial-gradient(circle at center, rgba(0,0,0,0) 10%, rgba(0,0,0,0.95) 100%)',
          zIndex: 2,
        }}
      />

      {/* Posters */}
      <div
        ref={containerRef}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gridAutoRows: 'auto',
          gap: 0,
          overflowY: 'scroll', // still scrolls automatically
          scrollBehavior: 'smooth',
          height: '100vh',
          position: 'relative',
          zIndex: 1,
          pointerEvents: 'none', // disables user interaction
          scrollbarWidth: 'none', // hide scrollbar in Firefox
          msOverflowStyle: 'none', // hide scrollbar in IE 10+
        }}
      >

        {topMovies.length === 0 ? <p>Loading...</p> : renderPosters()}
      </div>
    </div>
  );
};

export default LandingPage;
