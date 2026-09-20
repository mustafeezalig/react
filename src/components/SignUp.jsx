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
    <section className="mx-auto grid max-w-[500px] justify-stretch px-6 py-[9vh] max-[520px]:w-full max-[520px]:px-[18px] max-[520px]:py-[10vh]">
      <div className="rounded-[18px] border border-[#e1c395] bg-[#fffaf2] p-[clamp(28px,5vw,48px)] shadow-[0_18px_50px_rgba(16,42,46,0.14)] max-[520px]:px-5 max-[520px]:py-[26px]">
        <div className="text-center">
          <p className="mb-3 text-[0.8rem] font-bold uppercase tracking-[0.16em] text-[#b36b3d]">Join Zions</p>
          <h1 className="m-0 font-serif text-[clamp(2.4rem,7vw,4rem)] leading-none text-[#16363a]">Create account.</h1>
          <p className="mt-3.5 text-[0.95rem] text-[#65706d]">Set up your account to get started.</p>
        </div>
        <form className="mt-8 grid grid-cols-1 gap-[18px] text-left" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label className="text-[0.85rem] font-bold text-[#16363a]" htmlFor="signup-username">Username</label>
            <input className="rounded-lg border border-[#d0bfa8] bg-[#fffdf9] p-3.5 font-inherit focus:border-[#d58a42] focus:outline focus:outline-3 focus:outline-[rgba(213,138,66,0.2)]" id="signup-username" name="username" type="text" placeholder="Choose a username" autoComplete="username" value={form.username} onChange={handleChange} required />
          </div>
          <div className="grid gap-2">
            <label className="text-[0.85rem] font-bold text-[#16363a]" htmlFor="signup-email">Email address</label>
            <input className="rounded-lg border border-[#d0bfa8] bg-[#fffdf9] p-3.5 font-inherit focus:border-[#d58a42] focus:outline focus:outline-3 focus:outline-[rgba(213,138,66,0.2)]" id="signup-email" name="email" type="email" placeholder="you@example.com" autoComplete="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="grid gap-2">
            <label className="text-[0.85rem] font-bold text-[#16363a]" htmlFor="signup-password">Password</label>
            <div className="relative">
              <input className="w-full rounded-lg border border-[#d0bfa8] bg-[#fffdf9] p-3.5 pr-12 font-inherit focus:border-[#d58a42] focus:outline focus:outline-3 focus:outline-[rgba(213,138,66,0.2)]" id="signup-password" name="password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" autoComplete="new-password" value={form.password} onChange={handleChange} required />
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
          <div className="grid gap-2">
            <label className="text-[0.85rem] font-bold text-[#16363a]" htmlFor="signup-role">Role</label>
            <select className="rounded-lg border border-[#d0bfa8] bg-[#fffdf9] p-3.5 font-inherit focus:border-[#d58a42] focus:outline focus:outline-3 focus:outline-[rgba(213,138,66,0.2)]" id="signup-role" name="role" value={form.role} onChange={handleChange}>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
          <button className="rounded-lg border-0 bg-[#c56f39] p-3.5 font-inherit font-bold text-white transition hover:-translate-y-px hover:bg-[#a9532f] disabled:cursor-wait disabled:opacity-70" type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Creating account...' : 'Create account'}
          </button>
          {message && <p className={status === 'error' ? 'm-0 text-[0.85rem] text-[#a33f2e]' : 'm-0 text-[0.85rem] text-[#3f765f]'} role="alert">{message}</p>}
        </form>
        <p className="mt-[26px] text-center text-[0.9rem] text-[#65706d]">Already have an account? <Link className="font-bold text-[#b36b3d] no-underline hover:underline" to="/login">Log in</Link></p>
      </div>
    </section>
  )
}

export default SignUp
