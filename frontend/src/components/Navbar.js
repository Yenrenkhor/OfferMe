import React from "react";
import { NavLink } from "react-router-dom";

const NavBar = () => (
  <nav className="navbar">
    <ul className="navbar-links">
      <li>
        <NavLink to="/" className={({ isActive }) => (isActive ? "active-link" : "")}>
          Offer
        </NavLink>
      </li>
      <li>
        <NavLink to="/marketplace" className={({ isActive }) => (isActive ? "active-link" : "")}>
          Marketplace
        </NavLink>
      </li>
    </ul>
  </nav>
);

export default NavBar;
