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
    <section className="data-page">
      <div className="data-heading">
        <h2>Users List</h2>
      </div>

      {status === 'loading' && <p className="data-message">Loading users...</p>}
      {status === 'error' && (
        <p className="data-message data-error">{error || 'Could not load the user data.'}</p>
      )}
      {status === 'success' && (
        <div className="table-wrapper">
          <table className="data-table">
            <caption className="sr-only">User directory from the admin API</caption>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.userId}>
                  <td>{user.userName}</td>
                  <td>{user.email}</td>
                  <td>{user.enabled ? 'Active' : 'Disabled'}</td>
                  <td>{user.createdDate ? new Date(user.createdDate).toLocaleDateString() : '-'}</td>
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
