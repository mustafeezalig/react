import { useState } from 'react'
import { Link } from 'react-router-dom'
import { buildApiUrl } from '../config/api.js'

function SignUp() {
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    role: 'admin',
  })
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function getXsrfToken() {
    return document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const xsrfToken = getXsrfToken()
      const response = await fetch(buildApiUrl('/auth/public/signup'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
        },
        credentials: 'include',
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
          role: [form.role],
        }),
      })

      const data = await response.json()
      const apiMessage = data.message || 'Unable to create your account.'

      if (!response.ok) {
        throw new Error(apiMessage)
      }

      setStatus('success')
      setMessage(apiMessage)
      setForm({ username: '', email: '', password: '', role: 'admin' })
    } catch (signupError) {
      setStatus('error')
      setMessage(signupError.message || 'Unable to connect to the signup service.')
    }
  }

  return (
    <section className="login-page signup-page">
      <div className="login-card">
        <div className="login-heading">
          <p className="eyebrow">Join Zions</p>
          <h1>Create account.</h1>
          <p>Set up your account to get started.</p>
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-field">
            <label htmlFor="signup-username">Username</label>
            <input id="signup-username" name="username" type="text" placeholder="Choose a username" autoComplete="username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label htmlFor="signup-email">Email address</label>
            <input id="signup-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-field">
            <label htmlFor="signup-password">Password</label>
            <div className="password-input-wrap">
              <input id="signup-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" autoComplete="new-password" value={form.password} onChange={handleChange} required />
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
          <div className="form-field">
            <label htmlFor="signup-role">Role</label>
            <select id="signup-role" name="role" value={form.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Creating account...' : 'Create account'}
          </button>
          {message && <p className={status === 'error' ? 'login-error' : 'login-success'} role="alert">{message}</p>}
        </form>
        <p className="signup-prompt">Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </section>
  )
}

export default SignUp
