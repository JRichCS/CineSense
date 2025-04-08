import React, { useEffect, useState } from "react";
import getUserInfo from '../utilities/decodeJwt';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import ReactNavbar from 'react-bootstrap/Navbar';
import { Link } from 'react-router-dom'; // Import Link

// Here, we display our Navbar
export default function Navbar() {
  const [user, setUser] = useState({});

  useEffect(() => {
    setUser(getUserInfo());
  }, []);

  return (
    <ReactNavbar bg="dark" variant="dark">
      <Container>
        <Nav className="me-auto">
          <Nav.Link href="/">Start</Nav.Link>
          <Nav.Link href="/home">Home</Nav.Link>
          <Nav.Link href="/privateUserProfile">Profile</Nav.Link>
          
          {/* Updated this to use Nav.Link for consistency */}
          <Nav.Link as={Link} to="/recommend">Movie Recommendations</Nav.Link>
        </Nav>
      </Container>
    </ReactNavbar>
  );
}
