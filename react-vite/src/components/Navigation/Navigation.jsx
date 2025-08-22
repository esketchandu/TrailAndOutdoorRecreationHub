// src/components/Navigation/Navigation.jsx
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import ProfileButton from "./ProfileButton";
import "./Navigation.css";

function Navigation() {
  const user = useSelector(state => state.session.user);

  return (
    <nav className="navigation">
      <div className="nav-container">
        <NavLink to="/" className="nav-logo">
          Trail Hub
        </NavLink>

        <div className="nav-links">
          <NavLink to="/trails" className="nav-link">
            Explore Trails
          </NavLink>

          {user && (
            <NavLink to="/trails/new" className="nav-link">
              Add Trail
            </NavLink>
          )}

          <ProfileButton />
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
