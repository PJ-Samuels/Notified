import Container from 'react-bootstrap/Container';
// import NavbarBrand from 'react-bootstrap/esm/NavbarBrand';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
// import NavDropdown from 'react-bootstrap/NavDropdown';
import "./css/nav.css";
import React, { useState } from 'react';
import { Link } from 'react-router-dom';


function NotifyNavbar(props) {
  const [page, changePage] = React.useState(false);
  return (
    <Container className = "container">
      {/* <Nav className = "dropdown">Menu</Nav> */}
      <Navbar className = "navbar" bg="light" expand="lg">NOTIFY</Navbar>
      <Nav className = "navlinks">
        <Nav.Link className = "link" href="/home">Home</Nav.Link>
        <Nav.Link className = "link" href="/releases">Releases</Nav.Link>
        <Nav.Link className = "link" href="/news">News</Nav.Link>
        <Nav.Link className = "link" href="/faq">FAQ</Nav.Link>
      </Nav>
      <Link className = "signup" to="/signup"> Login </Link>
    </Container>
    
  );

}

export default NotifyNavbar;
