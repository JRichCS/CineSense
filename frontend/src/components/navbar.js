// src/components/Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Navbar, Nav, Container } from 'react-bootstrap';
import getUserInfo from '../utilities/decodeJwt';
import { FaSearch, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';

import logo from '../CineSense_Logo.png'; // Path to your logo

export default function NavigationBar() {
  const [user, setUser] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false); // State for the confirmation box
  const navigate = useNavigate();

  
  useEffect(() => {
    setUser(getUserInfo());
  }, []);

  // Handle Log Out
  const handleLogout = () => {
    localStorage.clear();
    setUser(null); // Clear user state
    navigate("/"); // Redirect to home page
  };

  // Handle Cancel Logout
  const handleCancelLogout = () => {
    setShowConfirmation(false); // Hide confirmation box
  };

  const navbarStyles = {
    backgroundColor: '#222',
    padding: '10px 20px',
  };

  const buttonStyles = {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    color: '#fff',
  };

  const confirmationBoxStyles = {
    position: 'absolute',
    top: '60px',
    right: '20px',
    backgroundColor: '#f8f9fa',
    border: '1px solid #cc5c99',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    width: '200px',
    textAlign: 'center',
    zIndex: 1000,
  };

  return (
    <Navbar style={navbarStyles} variant="dark" expand="lg" sticky="top">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <img
            src={logo} // Use the imported logo
            alt="Logo"
            style={{ height: '40px' }} // Adjust the logo size
          />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="navbar-nav" />
        <Navbar.Collapse id="navbar-nav">
          <Nav className="ml-auto">
            

            {/* Conditional rendering of buttons based on user login status */}
            {user ? (
              <>
                <Button
                  variant="outline-danger"
                  onClick={() => setShowConfirmation(true)}
                  style={buttonStyles}
                >
                  <FaSignOutAlt className="mr-2" />
                  Log Out
                </Button>

                {/* Log Out Confirmation Box */}
                {showConfirmation && (
                  <div style={confirmationBoxStyles}>
                    <p>Are you sure you want to log out?</p>
                    <div>
                      <Button
                        variant="danger"
                        onClick={handleLogout}
                        style={{ marginRight: '10px' }}
                      >
                        Yes
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={handleCancelLogout}
                      >
                        No
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login" className="text-white">
                  <FaSignInAlt className="mr-2" />
                  Log In
                </Nav.Link>
                <Nav.Link as={Link} to="/signup" className="text-white">
                  <FaUserPlus className="mr-2" />
                  Create Account
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
