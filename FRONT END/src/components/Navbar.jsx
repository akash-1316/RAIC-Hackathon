
import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import { useAuth } from '../context/AuthContext.jsx';
import { apiRequest } from '../lib/api.js';

export default function Navbar() {
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [workflow, setWorkflow] = useState(null);

  useEffect(() => {
    let active = true;

    if (!isAuthenticated) {
      setWorkflow(null);
      return;
    }

    apiRequest('/registrations/mine')
      .then(data => {
        if (active) {
          setWorkflow(data.workflow || {});
        }
      })
      .catch(() => {
        if (active) setWorkflow(null);
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const closeMenu = () => setMenuOpen(false);

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate('/');
  };

  const getParticipantAction = () => {
    if (!workflow?.hasRegistration) {
      return {
        label: 'Register Team',
        path: '/register-team'
      };
    }

    if (workflow.complete) {
      return {
        label: 'Dashboard',
        path: '/participant'
      };
    }

    if (workflow.paymentStatus === 'rejected') {
      return {
        label: 'Resubmit Payment',
        path: '/offline-payment'
      };
    }

    if (workflow.paymentStatus === 'not_submitted') {
      return {
        label: 'Complete Payment',
        path: '/offline-payment'
      };
    }

    return {
      label: 'My Dashboard',
      path: '/participant'
    };
  };

  const participantAction = getParticipantAction();

  return (
    <header className="site-header">

      <div className="nav-wrap">

        {/* RAIC BRANDING */}

        <Link
          to="/"
          className="brand"
          onClick={closeMenu}
          aria-label="RAIC Home"
        >
          <span className="brand-name">
            R<span className="brand-ai">AI</span>C
          </span>

          <span className="brand-subtitle">
            RAGHU ARTIFICIAL INTELLIGENCE CLUB
          </span>
        </Link>

        {/* MOBILE MENU BUTTON */}

        <button
          className="menu-toggle"
          type="button"
          aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* NAVIGATION LINKS */}

        <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>

          <NavLink to="/" end onClick={closeMenu}>
            Home
          </NavLink>

          <NavLink to="/about" onClick={closeMenu}>
            About
          </NavLink>

          <NavLink to="/tiers" onClick={closeMenu}>
            Tiers
          </NavLink>

          <NavLink to="/pricing" onClick={closeMenu}>
            Pricing
          </NavLink>

          <NavLink to="/contact" onClick={closeMenu}>
            Contact
          </NavLink>

          {/* MOBILE AUTHENTICATION ACTIONS */}

          <div className="mobile-nav-actions">

            {isAuthenticated ? (
              <>
                <span className="mobile-signin">
                  Welcome, {user?.name || 'Participant'}
                </span>

                <Link
                  to={participantAction.path}
                  className="nav-cta"
                  onClick={closeMenu}
                >
                  {participantAction.label}
                </Link>

                <Link
                  to="/profile"
                  className="mobile-signin"
                  onClick={closeMenu}
                >
                  My Profile
                </Link>

                <button
                  type="button"
                  className="mobile-signin"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/signin"
                  className="mobile-signin"
                  onClick={closeMenu}
                >
                  Sign In
                </Link>

                <Link
                  to="/signup"
                  className="nav-cta"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}

          </div>
        </nav>

        {/* DESKTOP AUTHENTICATION ACTIONS */}

        <div className="desktop-nav-actions">

          {isAuthenticated ? (
            <>
              <Link
                to={participantAction.path}
                className="signin-link"
              >
                {participantAction.label}
              </Link>

              <Link
                to="/profile"
                className="signin-link"
              >
                {user?.name || 'Profile'}
              </Link>

              <button
                type="button"
                className="nav-cta"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/signin"
                className="signin-link"
              >
                Sign In
              </Link>

              <Link
                to="/signup"
                className="nav-cta"
              >
                Register
              </Link>
            </>
          )}

        </div>

      </div>
    </header>
  );
}
