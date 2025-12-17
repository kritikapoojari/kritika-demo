import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserRole, ROLES } from '../../config/roles';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const userRole = getUserRole();

  return (
    <header className="header" role="banner">
      <div className="header-container">
        <Link to="/" className="header-logo" aria-label="Knowledge Portal Home">
          <h1>Knowledge Portal</h1>
        </Link>
        
        <nav className="header-nav" aria-label="Main navigation">
          <ul className="nav-list">
            <li>
              <Link to="/documentation" className="nav-link">
                Documentation
              </Link>
            </li>
            <li>
              <Link to="/faqs" className="nav-link">
                FAQs
              </Link>
            </li>
            {(userRole === ROLES.ADMIN || userRole === ROLES.EDITOR) && (
              <li>
                <Link to="/analytics" className="nav-link">
                  Analytics
                </Link>
              </li>
            )}
          </ul>
        </nav>

        <div className="header-actions">
          <select
            className="role-selector"
            value={userRole}
            onChange={(e) => {
              localStorage.setItem('userRole', e.target.value);
              navigate(0); // Refresh to apply role changes
            }}
            aria-label="Select user role"
          >
            <option value={ROLES.GUEST}>Guest</option>
            <option value={ROLES.VIEWER}>Viewer</option>
            <option value={ROLES.EDITOR}>Editor</option>
            <option value={ROLES.ADMIN}>Admin</option>
          </select>
        </div>
      </div>
    </header>
  );
};

export default Header;

