import { useEffect, useMemo, useState } from 'react'
import { buildApiUrl } from '../config/api.js'

const sections = [
  { id: 'add', label: 'Add User' },
  { id: 'search', label: 'Search User' },
  { id: 'list', label: 'User List' },
]

function normalizeRole(role) {
  const roleName = typeof role === 'object' ? role?.roleName : role

  return String(roleName || '').toUpperCase().includes('ADMIN')
    ? 'Administrator'
    : 'User'
}

function AppUser() {
  const [activeSection, setActiveSection] = useState('list')
  const [users, setUsers] = useState([])
  const [usersStatus, setUsersStatus] = useState('loading')
  const [searchTerm, setSearchTerm] = useState('')
  const [form, setForm] = useState({ name: '', email: '', role: 'User' })
  const [message, setMessage] = useState('')
  const [toastType, setToastType] = useState('success')
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    if (!message) return undefined

    const timeoutId = setTimeout(() => setMessage(''), 3500)
    return () => clearTimeout(timeoutId)
  }, [message])

  useEffect(() => {
    const controller = new AbortController()
    const token = localStorage.getItem('authToken')
    const savedUser = JSON.parse(localStorage.getItem('authUser') || '{}')
    const signedInRoles = savedUser.roles || []
    const xsrfToken = document.cookie
      .split('; ')
      .find((cookie) => cookie.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    async function loadUsers() {
      if (!token) {
        setUsersStatus('error')
        setMessage('Your session has expired. Please log in again.')
        return
      }

      try {
        const response = await fetch(buildApiUrl('/admin/getusers'), {
          headers: {
            accept: 'application/json',
            Authorization: `Bearer ${token}`,
            ...(xsrfToken ? { 'X-XSRF-TOKEN': decodeURIComponent(xsrfToken) } : {}),
          },
          credentials: 'include',
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error(response.status === 401 || response.status === 403
            ? 'You are not authorized to view the user list...'
            : 'Unable to load users.')
        }

        const apiUsers = await response.json()
        setUsers(apiUsers.map((user) => ({
          id: user.userId,
          name: user.userName,
          email: user.email,
          role: normalizeRole(
            user.role
              || user.roles?.[0]
              || (user.userName === savedUser.username ? signedInRoles[0] : 'User'),
          ),
          accountStatus: user.enabled && user.accountNonLocked ? 'Active' : 'Disabled',
        })))
        setUsersStatus('success')
      } catch (loadError) {
        if (loadError.name !== 'AbortError') {
          setUsersStatus('error')
          setMessage(loadError.message)
        }
      }
    }

    loadUsers()
    return () => controller.abort()
  }, [])

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.toLowerCase().trim()
    if (!normalizedSearch) return users

    return users.filter((user) =>
      [user.name, user.email, user.role].some((value) =>
        value.toLowerCase().includes(normalizedSearch),
      ),
    )
  }, [searchTerm, users])

  function handleFormChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value })
  }

  function resetForm() {
    setForm({ name: '', email: '', role: 'User' })
    setEditingId(null)
  }

  function handleUserSubmit(event) {
    event.preventDefault()
    if (editingId) {
      setUsers(users.map((user) => user.id === editingId ? { ...user, ...form } : user))
      setToastType('success')
      setMessage(`${form.name} was updated successfully.`)
    } else {
      const newUser = { ...form, id: Date.now() }
      setUsers([...users, newUser])
      setToastType('success')
      setMessage(`${newUser.name} was added successfully.`)
    }
    resetForm()
    setActiveSection('list')
  }

  function handleEdit(user) {
    setForm({ name: user.name, email: user.email, role: normalizeRole(user.role) })
    setEditingId(user.id)
    setMessage('')
    setActiveSection('add')
  }

  function handleDelete(user) {
    const confirmed = window.confirm(`Are you sure you want to delete ${user.name}? This action cannot be undone.`)
    if (!confirmed) {
      setToastType('danger')
      setMessage(`${user.name} was not deleted.`)
      return
    }

    setUsers(users.filter((currentUser) => currentUser.id !== user.id))
    if (editingId === user.id) resetForm()
    setToastType('danger')
    setMessage(`${user.name} was deleted.`)
  }

  function selectSection(sectionId) {
    setActiveSection(sectionId)
    setMessage('')
  }

  function openAddUser() {
    resetForm()
    setMessage('')
    setActiveSection('add')
  }

  return (
    <section className="app-user-page">
      {message && <div className={`app-toast ${toastType === 'danger' ? 'danger' : ''}`} role="status" aria-live="polite">{message}</div>}
      <aside className="app-user-sidebar" aria-label="User management navigation">
        <div>
          <p className="eyebrow">Administration</p>
          <h1>User management</h1>
          <p className="sidebar-copy">Manage your application users from one place!</p>
        </div>
        <nav className="app-user-menu">
          {sections.map((section) => (
            <button
              className={activeSection === section.id ? 'active' : ''}
              key={section.id}
              type="button"
              onClick={() => section.id === 'add' ? openAddUser() : selectSection(section.id)}
            >
              <span>{section.label}</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          ))}
        </nav>
        <div className="user-count">
          <strong>{users.length}</strong>
          <span>Total users</span>
        </div>
      </aside>

      <div className="app-user-content">
        {activeSection === 'add' && (
          <div className="user-panel">
            <div className="panel-heading">
              <p className="eyebrow">{editingId ? 'Edit account' : 'New account'}</p>
              <h2>{editingId ? 'Edit User' : 'Add User'}</h2>
              <p>{editingId ? 'Update this user profile.' : 'Create a user profile for your application.'}</p>
            </div>
            <form className="user-form" onSubmit={handleUserSubmit}>
              <label>
                Full name
                <input name="name" value={form.name} onChange={handleFormChange} placeholder="Enter full name" required />
              </label>
              <label>
                Email address
                <input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="user@example.com" required />
              </label>
              <label>
                Role
                <select name="role" value={form.role} onChange={handleFormChange}>
                  <option>User</option>
                  <option>Administrator</option>
                </select>
              </label>
              <div className="form-actions">
                <button className="primary-action" type="submit">{editingId ? 'Save changes' : 'Add user'}</button>
                {editingId && <button className="secondary-action" type="button" onClick={() => { resetForm(); setActiveSection('list') }}>Cancel</button>}
              </div>
            </form>
          </div>
        )}

        {activeSection === 'search' && (
          <div className="user-panel">
            <div className="panel-heading">
              <p className="eyebrow">Find a user</p>
              <h2>Search User</h2>
              <p>Search by name, email address, or role.</p>
            </div>
            <label className="search-field">
              Search users
              <input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Try Emily or Administrator" />
            </label>
            <UserRows users={filteredUsers} emptyMessage="No users match your search." onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        )}

        {activeSection === 'list' && (
          <div className="user-panel">
            <div className="panel-heading panel-heading-row">
              <div>
                <p className="eyebrow">Directory</p>
                <h2>User List</h2>
                <p>Everyone with access to this application.</p>
              </div>
              <button className="primary-action compact-action" type="button" onClick={openAddUser}>+ Add user</button>
            </div>
            {usersStatus === 'loading' && <p className="data-message">Loading users...</p>}
            {usersStatus === 'error' && <p className="data-message data-error">Unable to load the user list.</p>}
            {usersStatus === 'success' && <UserRows users={users} emptyMessage="No users have been added yet." onEdit={handleEdit} onDelete={handleDelete} />}
          </div>
        )}
      </div>
    </section>
  )
}

function UserRows({ users, emptyMessage, onEdit, onDelete }) {
  if (!users.length) return <p className="data-message">{emptyMessage}</p>

  return (
    <div className="user-list">
      {users.map((user) => (
        <article className="user-row" key={user.id}>
          <div className="user-avatar">{user.name.charAt(0)}</div>
          <div className="user-details">
            <strong>{user.name}</strong>
            <span>{user.email}</span>
          </div>
          <span className="user-role">{user.role}</span>
          {user.accountStatus && <span className="user-status">{user.accountStatus}</span>}
          <div className="user-actions">
            <button type="button" onClick={() => onEdit(user)}>Edit</button>
            <button type="button" onClick={() => onDelete(user)}>Delete</button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default AppUser
