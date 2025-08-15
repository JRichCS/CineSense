import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import getUserInfo from "../../utilities/decodeJwt";
import axios from "axios";
import { FaUser, FaFilm, FaSignOutAlt, FaEdit, FaCog, FaHeart, FaHistory, FaStar } from "react-icons/fa";

const PrivateUserProfile = () => {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState({});
  const [userProfile, setUserProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userInfo = getUserInfo();
      if (userInfo) {
        setUser(userInfo);
        
        try {
          // Fetch full user profile data from backend
          const response = await axios.get(`${process.env.REACT_APP_BACKEND_SERVER_URI}/user/getUserById`, {
            params: { userId: userInfo.id }
          });
          setUserProfile(response.data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // Fallback to basic user info
          setUserProfile({ date: new Date() });
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-cine-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cine-gold mx-auto mb-6"></div>
          <p className="text-cine-text-secondary">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cine-dark flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-cine-red rounded-full flex items-center justify-center mb-6">
            <FaUser className="h-8 w-8 text-cine-text" />
          </div>
          <h2 className="text-2xl font-cine-display font-bold text-cine-text mb-4">
            Access Denied
          </h2>
          <p className="text-cine-text-secondary mb-6">
            Please log in to view your profile
          </p>
          <Link to="/login" className="cine-button">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

 

  return (
    <div className="min-h-screen bg-cine-dark">
      {/* Profile Header */}
      <div className="bg-cine-dark-gradient pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 bg-cine-gold rounded-full flex items-center justify-center mb-6 animate-pulse-glow">
              <FaUser className="h-12 w-12 text-cine-dark" />
            </div>
            <h1 className="text-4xl font-cine-display font-bold text-cine-text mb-2">
              {user.username}
            </h1>
            <p className="text-cine-text-secondary text-lg">
              CineSense Member
            </p>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="flex justify-center">
          {/* Main Profile Card */}
          <div className="w-full max-w-2xl">
            <div className="cine-card p-8">
              <h2 className="text-2xl font-cine-display font-bold text-cine-text mb-6 flex items-center">
                <FaUser className="mr-3 text-cine-gold" />
                Profile Information
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-cine-text-secondary mb-2">
                    Username
                  </label>
                  <div className="cine-input bg-cine-gray cursor-not-allowed">
                    {user.username}
                  </div>
                </div>

                <div className="pt-6 border-t border-cine-gray">
                  <h3 className="text-lg font-semibold text-cine-text mb-4">
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Link
                      to="/recommend"
                      className="cine-button-secondary flex items-center justify-center space-x-2 py-4"
                    >
                      <FaFilm className="h-5 w-5" />
                      <span>Get Recommendations</span>
                    </Link>
                    
                    <button
                      onClick={handleShow}
                      className="cine-button-danger flex items-center justify-center space-x-2 py-4"
                    >
                      <FaSignOutAlt className="h-5 w-5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="cine-card p-8 max-w-md w-full animate-fade-in">
            <div className="text-center">
              <div className="mx-auto h-16 w-16 bg-cine-red rounded-full flex items-center justify-center mb-6">
                <FaSignOutAlt className="h-8 w-8 text-cine-text" />
              </div>
              <h3 className="text-xl font-cine-display font-bold text-cine-text mb-4">
                Ready to leave?
              </h3>
              <p className="text-cine-text-secondary mb-6">
                Are you sure you want to sign out of your account?
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleLogout}
                  className="cine-button-danger flex-1"
                >
                  Yes, Sign Out
                </button>
                <button
                  onClick={handleClose}
                  className="cine-button-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-40 right-0 w-96 h-96 bg-cine-gold opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 left-0 w-96 h-96 bg-cine-blue opacity-5 rounded-full blur-3xl"></div>
      </div>
    </div>
  );
};

export default PrivateUserProfile;
