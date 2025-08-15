// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import getUserInfo from '../utilities/decodeJwt';
import { FaSearch, FaSignInAlt, FaUserPlus, FaSignOutAlt, FaUser, FaFilm, FaHome } from 'react-icons/fa';
import logo from '../CineSense_Logo.png';

export default function NavigationBar() {
  const [user, setUser] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setUser(getUserInfo());
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    navigate("/");
  };

  const handleCancelLogout = () => {
    setShowConfirmation(false);
  };

  return (
    <nav className="bg-cine-darker border-b border-cine-gray sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <img
                src={logo}
                alt="CineSense"
                className="h-10 w-auto transition-transform duration-300 group-hover:scale-110"
              />
              <span className="text-2xl font-cine-display font-bold cine-gradient-text">
                CineSense
              </span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="flex items-center space-x-2 text-cine-text-secondary hover:text-cine-gold transition-colors duration-300 group"
            >
              <FaHome className="text-lg group-hover:scale-110 transition-transform duration-300" />
              <span>Home</span>
            </Link>
            
            {user && (
              <Link
                to="/recommend"
                className="flex items-center space-x-2 text-cine-text-secondary hover:text-cine-gold transition-colors duration-300 group"
              >
                <FaFilm className="text-lg group-hover:scale-110 transition-transform duration-300" />
                <span>Discover</span>
              </Link>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative">
                <div className="flex items-center space-x-4">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 text-cine-text-secondary hover:text-cine-gold transition-colors duration-300 group"
                  >
                    <FaUser className="text-lg group-hover:scale-110 transition-transform duration-300" />
                    <span className="hidden sm:inline">{user.username}</span>
                  </Link>
                  
                  <button
                    onClick={() => setShowConfirmation(true)}
                    className="cine-button-danger flex items-center space-x-2"
                  >
                    <FaSignOutAlt className="text-lg" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>

                {/* Logout Confirmation Modal */}
                {showConfirmation && (
                  <div className="absolute right-0 top-12 w-80 bg-cine-darker border border-cine-gray rounded-xl shadow-cine p-6 animate-fade-in">
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-cine-text mb-4">
                        Ready to leave?
                      </h3>
                      <p className="text-cine-text-secondary mb-6">
                        Are you sure you want to log out of your account?
                      </p>
                      <div className="flex space-x-3">
                        <button
                          onClick={handleLogout}
                          className="cine-button-danger flex-1"
                        >
                          Yes, Logout
                        </button>
                        <button
                          onClick={handleCancelLogout}
                          className="cine-button-secondary flex-1"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="cine-button-secondary flex items-center space-x-2"
                >
                  <FaSignInAlt className="text-lg" />
                  <span>Sign In</span>
                </Link>
                <Link
                  to="/signup"
                  className="cine-button flex items-center space-x-2"
                >
                  <FaUserPlus className="text-lg" />
                  <span>Join</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
