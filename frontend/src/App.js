import React from "react";
import { BrowserRouter as Router, Route, Routes, NavLink } from "react-router-dom";
import Offer from "./pages/Offer"; 
import Marketplace from "./pages/Marketplace";

const App = () => {
  return (
    <Router>
      <div>
        <nav className="navbar">
          <ul>
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
        <Routes>
          <Route path="/" element={<Offer />} />
          <Route path="/marketplace" element={<Marketplace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
