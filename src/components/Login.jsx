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
    <section className="mx-auto grid max-w-[500px] justify-stretch px-6 py-[9vh] max-[520px]:w-full max-[520px]:px-[18px] max-[520px]:py-[10vh]">
      <div className="rounded-[18px] border border-[#e1c395] bg-[#fffaf2] p-[clamp(28px,5vw,48px)] shadow-[0_18px_50px_rgba(16,42,46,0.14)] max-[520px]:px-5 max-[520px]:py-[26px]">
        <div className="text-center">
          <p className="mb-3 text-[0.8rem] font-bold uppercase tracking-[0.16em] text-[#b36b3d]">Your account</p>
          <h1 className="m-0 font-serif text-[clamp(2.4rem,7vw,4rem)] leading-none text-[#16363a]">Welcome back.</h1>
          <p className="mt-3.5 text-[0.95rem] text-[#65706d]">Sign in to pick up where you left off.</p>
        </div>
        <form className="mt-8 grid grid-cols-1 gap-[18px] text-left" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label className="text-[0.85rem] font-bold text-[#16363a]" htmlFor="username">Username</label>
            <input className="rounded-lg border border-[#d0bfa8] bg-[#fffdf9] p-3.5 font-inherit focus:border-[#d58a42] focus:outline focus:outline-3 focus:outline-[rgba(213,138,66,0.2)]" id="username" type="text" placeholder="Enter your username" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required />
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-[1fr_auto] items-center gap-3 max-[520px]:grid-cols-1 max-[520px]:gap-1">
              <label className="text-[0.85rem] font-bold text-[#16363a]" htmlFor="password">Password</label>
              <a className="font-bold text-[#b36b3d] no-underline hover:underline focus-visible:underline" href="#forgot-password">Forgot password?</a>
            </div>
            <div className="relative">
              <input
                className="w-full rounded-lg border border-[#d0bfa8] bg-[#fffdf9] p-3.5 pr-12 font-inherit focus:border-[#d58a42] focus:outline focus:outline-3 focus:outline-[rgba(213,138,66,0.2)]"
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button
                className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center border-0 bg-transparent p-0 text-[#617286] hover:text-[#1687a8] focus-visible:text-[#1687a8]"
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="relative block h-[11px] w-[17px] rotate-45 rounded-[90%_10%] border-2 border-current after:absolute after:left-1/2 after:top-1/2 after:h-[5px] after:w-[5px] after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-current" aria-hidden="true" />
              </button>
            </div>
          </div>
          <label className="grid grid-cols-[auto_1fr] items-center gap-[9px] font-normal text-[#16363a]">
            <input className="h-4 w-4 accent-[#b36b3d]" type="checkbox" />
            <span>Remember me</span>
          </label>
          <button className="rounded-lg border-0 bg-[#c56f39] p-3.5 font-inherit font-bold text-white transition hover:-translate-y-px hover:bg-[#a9532f] disabled:cursor-wait disabled:opacity-70 disabled:transform-none" type="submit" disabled={status === 'loading' || status === 'success'}>
            {status === 'loading' ? 'Signing in...' : status === 'success' ? 'Logged in' : 'Log in'}
          </button>
          {status === 'success' && (
            <p className="m-0 text-[0.85rem] text-[#3f765f]" role="status">Login successful. Click Data in the header.</p>
          )}
          {status === 'error' && <p className="m-0 text-[0.85rem] text-[#a33f2e]" role="alert">{error}</p>}
        </form>
        <p className="mt-[26px] text-center text-[0.9rem] text-[#65706d]">New to Zions? <Link className="font-bold text-[#b36b3d] no-underline hover:underline" to="/signup">Create an account</Link></p>
      </div>
    </section>
  )
}

export default Login
