import { Link } from 'react-router-dom'

function Header({ user, onLogout }) {
  return (
    <header className="navbar">
      <Link className="brand" to="/">Zions</Link>
      <nav className="nav-links" aria-label="Main navigation">
        <Link to="/">Home</Link>
        {user && <Link to="/data">User List</Link>}
        {user && <Link to="/app-user">App-User</Link>}
        {user ? (
          <>
            <span className="user-name">Hi, {user.username}</span>
            <button className="logout-link" type="button" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link className="login-link" to="/login">Login</Link>
            <Link className="signup-link" to="/signup">Sign Up</Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header
