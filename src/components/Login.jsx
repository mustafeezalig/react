import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { buildApiUrl } from '../config/api.js'

function Login({ onLogin }) {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')

  function getXsrfToken() {
    return document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('loading')
    setError('')
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    try {
      const xsrfToken = getXsrfToken()
      const response = await fetch(buildApiUrl('/auth/public/signin'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
        signal: controller.signal,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed. Check your credentials.')
      }

      localStorage.setItem('authToken', data.jwtToken)
      localStorage.setItem('authUser', JSON.stringify(data))
      setStatus('success')
      onLogin(data)
      navigate('/')
    } catch (loginError) {
      setStatus('error')
      setError(loginError.name === 'AbortError'
        ? 'The login request timed out. Please try again.'
        : loginError.message)
    } finally {
      clearTimeout(timeoutId)
    }
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <div className="login-heading">
          <p className="eyebrow">Your account</p>
          <h1>Welcome back.</h1>
          <p>Sign in to pick up where you left off.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="username">Username</label>
            <input id="username" type="text" placeholder="Enter your username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
          </div>
          <div className="form-field">
            <div className="password-label">
              <label htmlFor="password">Password</label>
              <a href="#forgot-password">Forgot password?</a>
            </div>
            <div className="password-input-wrap">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="eye-icon" aria-hidden="true" />
              </button>
            </div>
          </div>
          <label className="remember-me">
            <input type="checkbox" />
            <span>Remember me</span>
          </label>
          <button type="submit" disabled={status === 'loading' || status === 'success'}>
            {status === 'loading' ? 'Signing in...' : status === 'success' ? 'Logged in' : 'Log in'}
          </button>
          {status === 'success' && (
            <p className="login-success" role="status">Login successful. Click Data in the header.</p>
          )}
          {status === 'error' && <p className="login-error" role="alert">{error}</p>}
        </form>
        <p className="signup-prompt">New to Zions? <Link to="/signup">Create an account</Link></p>
      </div>
    </section>
  )
}

export default Login
