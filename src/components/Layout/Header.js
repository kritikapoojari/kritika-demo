import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getUserRole, ROLES, setUserRole } from '../../config/roles';
import './Header.css';

const ROLE_META = {
  [ROLES.GUEST]:  { label: 'Guest',  icon: '👤', desc: 'Read-only, no feedback or analytics' },
  [ROLES.VIEWER]: { label: 'Viewer', icon: '👁️', desc: 'Read-only + can submit feedback' },
  [ROLES.EDITOR]: { label: 'Editor', icon: '✏️', desc: 'Read & write docs, FAQs + analytics' },
  [ROLES.ADMIN]:  { label: 'Admin',  icon: '🛡️', desc: 'Full access — read, write, delete, analytics' },
};

const ROLE_ORDER = [ROLES.GUEST, ROLES.VIEWER, ROLES.EDITOR, ROLES.ADMIN];

const Header = () => {
  const navigate = useNavigate();
  const userRole = getUserRole();
  const meta = ROLE_META[userRole] || ROLE_META[ROLES.GUEST];
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (role) => {
    setOpen(false);
    setUserRole(role);
    navigate(0);
  };

  return (
    <header className="header" role="banner">
      <div className="header-container">
        <Link to="/" className="header-logo" aria-label="Knowledge Portal Home">
          <div className="logo-mark" aria-hidden="true">KP</div>
          <span className="logo-text">Knowledge Portal</span>
        </Link>

        <div className="header-actions">
          <div className={`role-dropdown-wrap${open ? ' role-dropdown-wrap--open' : ''}`} ref={wrapperRef}>
            {/* Trigger button — sized entirely by its own content */}
            <button
              className={`role-trigger role-trigger--${userRole}`}
              onClick={() => setOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-label={`Current role: ${meta.label}. Click to switch.`}
              title={meta.desc}
            >
              <span className="role-trigger-icon">{meta.icon}</span>
              <span className="role-trigger-label">{meta.label}</span>
              <span className="role-trigger-caret" aria-hidden="true">▾</span>
            </button>

            {/* Dropdown panel */}
            {open && (
              <ul className="role-menu" role="listbox" aria-label="Switch role">
                {ROLE_ORDER.map((role) => {
                  const rm = ROLE_META[role];
                  const active = role === userRole;
                  return (
                    <li
                      key={role}
                      role="option"
                      aria-selected={active}
                      className={`role-menu-item${active ? ' role-menu-item--active' : ''} role-menu-item--${role}`}
                      onClick={() => handleSelect(role)}
                    >
                      <span className="role-menu-icon">{rm.icon}</span>
                      <span className="role-menu-text">
                        <span className="role-menu-name">{rm.label}</span>
                        <span className="role-menu-desc">{rm.desc}</span>
                      </span>
                      {active && <span className="role-menu-check">✓</span>}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
