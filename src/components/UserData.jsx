import { useEffect, useState } from 'react'
import { buildApiUrl } from '../config/api.js'

function UserData() {
  const [users, setUsers] = useState([])
  const [status, setStatus] = useState('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const token = localStorage.getItem('authToken')

    if (!token) {
      setError('Your session has expired. Please log in again.')
      setStatus('error')
      return () => controller.abort()
    }

    const xsrfToken = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    fetch(buildApiUrl('/admin/getusers'), {
      headers: {
        accept: 'application/json',
        Authorization: `Bearer ${token}`,
        ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
      },
      credentials: 'include',
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.status === 401 || response.status === 403
            ? 'You are not authorized to view the user list.'
            : `Unable to load user data (${response.status}).`)
        }
        return response.json()
      })
      .then((userData) => {
        const records = Array.isArray(userData) ? userData : userData.users || []
        setUsers(records)
        setStatus('success')
      })
      .catch((loadError) => {
        if (loadError.name !== 'AbortError') {
          setError(loadError.message || 'Unable to load user data.')
          setStatus('error')
        }
      })

    return () => controller.abort()
  }, [])

  return (
    <section className="mx-auto grid w-full content-start px-6 py-[clamp(36px,7vw,84px)]">
      <div className="mb-[26px] grid gap-2 pt-6">
        <h2 className="m-0 font-serif text-[clamp(2.2rem,5vw,4rem)] leading-none text-[#172337]">Users List</h2>
      </div>

      {status === 'loading' && <p className="rounded-[20px] border border-[#dce6ee] bg-white px-6 py-7 text-center text-[#617286] shadow-[0_20px_50px_rgba(23,35,55,0.06)]">Loading users...</p>}
      {status === 'error' && (
        <p className="rounded-[20px] border border-[#dce6ee] bg-white px-6 py-7 text-center text-[#a9532f] shadow-[0_20px_50px_rgba(23,35,55,0.06)]">{error || 'Could not load the user data.'}</p>
      )}
      {status === 'success' && (
        <div className="overflow-x-auto rounded-[20px] border border-[#dce6ee] bg-white shadow-[0_20px_50px_rgba(23,35,55,0.1)]">
          <table className="w-full min-w-[720px] border-collapse text-left text-[#172337]">
            <caption className="absolute m-[-1px] h-px w-px overflow-hidden whitespace-nowrap">User directory from the admin API</caption>
            <thead>
              <tr>
                <th className="bg-[#172337] px-[18px] py-4 text-[0.78rem] uppercase tracking-[0.1em] text-[#f4c879]">Name</th>
                <th className="bg-[#172337] px-[18px] py-4 text-[0.78rem] uppercase tracking-[0.1em] text-[#f4c879]">Email</th>
                <th className="bg-[#172337] px-[18px] py-4 text-[0.78rem] uppercase tracking-[0.1em] text-[#f4c879]">Status</th>
                <th className="bg-[#172337] px-[18px] py-4 text-[0.78rem] uppercase tracking-[0.1em] text-[#f4c879]">Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userId}>
                  <td className="border-b border-[#e8eef4] bg-white px-[18px] py-4">{user.userName}</td>
                  <td className="border-b border-[#e8eef4] bg-white px-[18px] py-4">{user.email}</td>
                  <td className="border-b border-[#e8eef4] bg-white px-[18px] py-4">{user.enabled ? 'Active' : 'Disabled'}</td>
                  <td className="border-b border-[#e8eef4] bg-white px-[18px] py-4">{user.createdDate ? new Date(user.createdDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

export default UserData
