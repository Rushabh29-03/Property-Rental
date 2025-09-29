import React from 'react'
import { Link, useNavigate } from 'react-router'
import AuthService from '../../services/AuthService';
import './Header.css'

function Header() {
  const currentUser = AuthService.getCurrentUser();
  const isOwner = currentUser && currentUser.role === 'ROLE_OWNER'
  const isLoggedIn = !!currentUser

  const navigate = useNavigate();

  const handleLogout = () => {
    AuthService.logout();
    navigate('/login'); // Redirect to the login page after logout
    // Force a page reload or state update if necessary (depending on your setup)
    // window.location.reload(); 
  };
  return (
    <>
      <header className='navbar'>
        <div className="navbar-main">
          <Link to="/">
            <h2 className="text-3xl font-extrabold text-center">
          Easy Rents
        </h2>
          </Link>
        </div>

        <nav className="navbar-links">
          {/* Public Links */}
          <Link to="/">Home</Link>

          {/* user specific link */}
          {isLoggedIn && !isOwner &&(
            <Link to="/">Browse Rentals</Link>
          )}

          {/* Owner-Specific Links (Visible only to logged-in owners) */}
          {isLoggedIn && isOwner && (
            // <Link to="/owner-dashboard">Owner Dashboard</Link>
            <a href="owner-dashboard">Owner Dashboard</a>
          )}

          {/* Authentication Links (Conditional Rendering) */}
          {isLoggedIn
            ? (
              // Logged-in view
              <>
                <span className="navbar-user">Hello, {currentUser.username}!</span>
                <button onClick={handleLogout} className="navbar-logout-btn">
                  Logout
                </button>
              </>)
            : (
              // Logged-out view
              <Link to="/login">Login</Link>
            )}
        </nav>
      </header>
    </>
  )
}

export default Header