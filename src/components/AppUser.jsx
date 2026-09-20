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
    <section className="relative mx-auto grid w-full max-w-[1180px] grid-cols-[minmax(220px,280px)_minmax(0,1fr)] gap-[clamp(24px,5vw,64px)] bg-[#eef3f7] px-6 py-[clamp(36px,7vw,84px)] max-[860px]:grid-cols-1 max-[520px]:gap-6 max-[520px]:px-[18px] max-[520px]:py-7">
      {message && <div className={`fixed left-1/2 top-1/2 z-20 max-w-[min(360px,calc(100vw-48px))] -translate-x-1/2 -translate-y-1/2 animate-[toast-in_0.25s_ease-out] rounded-[10px] border px-[18px] py-3.5 text-[0.9rem] font-bold text-[#f5f8fb] shadow-[0_12px_28px_rgba(23,35,55,0.22)] ${toastType === 'danger' ? 'border-[#e07d77] bg-[#5f1f2b] text-[#fff3f1]' : 'border-[#b8e95d] bg-[#172337]'}`} role="status" aria-live="polite">{message}</div>}
      <aside className="grid min-h-[560px] min-w-0 content-between gap-9 rounded-[20px] border border-[#26384d] bg-[#172337] px-6 py-[30px] text-[#f5f8fb] shadow-[0_20px_45px_rgba(23,35,55,0.2)] max-[860px]:min-h-0" aria-label="User management navigation">
        <div>
          <p className="mb-4 text-[0.8rem] font-bold uppercase tracking-[0.16em] text-[#b8e95d]">Administration</p>
          <h1 className="m-0 max-w-full break-words font-serif text-[clamp(2rem,4vw,3rem)] leading-[1.05] text-[#f5f8fb]">User management</h1>
          <p className="mt-4 text-[0.9rem] text-[#a9b8c8]">Manage your application users from one-place!</p>
        </div>
        <nav className="grid gap-2 max-[860px]:grid-cols-3 max-[520px]:grid-cols-1">
          {sections.map((section) => (
            <button
              className={`grid w-full grid-cols-[1fr_auto] items-center rounded-lg border px-3.5 py-[13px] text-left font-inherit text-[#f8f3eb] transition-colors hover:border-[#b8e95d] hover:bg-[#26384d] hover:text-[#b8e95d] focus-visible:border-[#b8e95d] focus-visible:bg-[#26384d] focus-visible:text-[#b8e95d] ${activeSection === section.id ? 'border-[#b8e95d] bg-[#26384d] text-[#b8e95d]' : 'border-transparent bg-transparent'}`}
              key={section.id}
              type="button"
              onClick={() => section.id === 'add' ? openAddUser() : selectSection(section.id)}
            >
              <span>{section.label}</span>
              <span aria-hidden="true">&rarr;</span>
            </button>
          ))}
        </nav>
        <div className="grid gap-[3px] border-t border-[rgba(184,233,93,0.35)] pt-5">
          <strong className="text-[2rem] text-[#b8e95d]">{users.length}</strong>
          <span className="text-[0.8rem] text-[#a9b8c8]">Total users</span>
        </div>
      </aside>

      <div className="min-w-0 self-center">
        {activeSection === 'add' && (
          <div className="grid min-w-0 gap-7 rounded-[20px] border border-[#d5e0e9] bg-white p-[clamp(26px,5vw,48px)] shadow-[0_20px_50px_rgba(23,35,55,0.1)]">
            <div className="grid gap-2">
              <p className="m-0 text-[0.8rem] font-bold uppercase tracking-[0.16em] text-[#b36b3d]">{editingId ? 'Edit account' : 'New account'}</p>
              <h2 className="m-0 font-serif text-[clamp(2rem,5vw,3.5rem)] leading-none text-[#172337]">{editingId ? 'Edit User' : 'Add User'}</h2>
              <p className="mt-1 text-[#617286]">{editingId ? 'Update this user profile.' : 'Create a user profile for your application.'}</p>
            </div>
            <form className="grid grid-cols-2 gap-4 max-[520px]:grid-cols-1" onSubmit={handleUserSubmit}>
              <label className="grid min-w-0 gap-2 text-[0.85rem] font-bold text-[#16363a]">
                Full name
                <input className="w-full rounded-lg border border-[#c9d6e2] bg-[#f8fbfd] p-[13px] font-inherit text-[#172337] focus:border-[#2aa7c9] focus:outline focus:outline-3 focus:outline-[rgba(42,167,201,0.18)]" name="name" value={form.name} onChange={handleFormChange} placeholder="Enter full name" required />
              </label>
              <label className="grid min-w-0 gap-2 text-[0.85rem] font-bold text-[#16363a]">
                Email address
                <input className="w-full rounded-lg border border-[#c9d6e2] bg-[#f8fbfd] p-[13px] font-inherit text-[#172337] focus:border-[#2aa7c9] focus:outline focus:outline-3 focus:outline-[rgba(42,167,201,0.18)]" name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="user@example.com" required />
              </label>
              <label className="grid min-w-0 gap-2 text-[0.85rem] font-bold text-[#16363a] max-[520px]:col-auto [grid-column:1/-1] max-[520px]:[grid-column:auto]">
                Role
                <select className="w-full rounded-lg border border-[#c9d6e2] bg-[#f8fbfd] p-[13px] font-inherit text-[#172337] focus:border-[#2aa7c9] focus:outline focus:outline-3 focus:outline-[rgba(42,167,201,0.18)]" name="role" value={form.role} onChange={handleFormChange}>
                  <option>User</option>
                  <option>Administrator</option>
                </select>
              </label>
              <div className="col-span-full grid grid-flow-col auto-cols-max justify-start gap-2">
                <button className="rounded-lg border-0 bg-[#2aa7c9] px-5 py-[13px] font-inherit font-bold text-white hover:bg-[#1687a8]" type="submit">{editingId ? 'Save changes' : 'Add user'}</button>
                {editingId && <button className="rounded-lg border border-[#c9d6e2] bg-transparent px-5 py-[13px] font-inherit font-bold text-[#172337] hover:border-[#2aa7c9] hover:bg-[#eef8fb]" type="button" onClick={() => { resetForm(); setActiveSection('list') }}>Cancel</button>}
              </div>
            </form>
          </div>
        )}

        {activeSection === 'search' && (
          <div className="grid min-w-0 gap-7 rounded-[20px] border border-[#d5e0e9] bg-white p-[clamp(26px,5vw,48px)] shadow-[0_20px_50px_rgba(23,35,55,0.1)]">
            <div className="grid gap-2">
              <p className="m-0 text-[0.8rem] font-bold uppercase tracking-[0.16em] text-[#b36b3d]">Find a user</p>
              <h2 className="m-0 font-serif text-[clamp(2rem,5vw,3.5rem)] leading-none text-[#172337]">Search User</h2>
              <p className="mt-1 text-[#617286]">Search by name, email address, or role.</p>
            </div>
            <label className="grid gap-2 text-[0.85rem] font-bold text-[#16363a]">
              Search users
              <input className="w-full rounded-lg border border-[#c9d6e2] bg-[#f8fbfd] p-[13px] font-inherit text-[#172337] focus:border-[#2aa7c9] focus:outline focus:outline-3 focus:outline-[rgba(42,167,201,0.18)]" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Try Emily or Administrator" />
            </label>
            <UserRows users={filteredUsers} emptyMessage="No users match your search." onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        )}

        {activeSection === 'list' && (
          <div className="grid min-w-0 gap-7 rounded-[20px] border border-[#d5e0e9] bg-white p-[clamp(26px,5vw,48px)] shadow-[0_20px_50px_rgba(23,35,55,0.1)]">
            <div className="grid grid-cols-[1fr_auto] items-end gap-2 max-[520px]:grid-cols-1 max-[520px]:items-start max-[520px]:gap-[18px]">
              <div>
                <p className="m-0 text-[0.8rem] font-bold uppercase tracking-[0.16em] text-[#b36b3d]">Directory</p>
                <h2 className="m-0 font-serif text-[clamp(2rem,5vw,3.5rem)] leading-none text-[#172337]">User List</h2>
                <p className="mt-1 text-[#617286]">Everyone with access to this application.</p>
              </div>
              <button className="whitespace-nowrap rounded-lg border-0 bg-[#2aa7c9] px-5 py-[13px] font-inherit font-bold text-white hover:bg-[#1687a8]" type="button" onClick={openAddUser}>+ Add user</button>
            </div>
            {usersStatus === 'loading' && <p className="rounded-[20px] border border-[#dce6ee] bg-white px-6 py-7 text-center text-[#617286]">Loading users...</p>}
            {usersStatus === 'error' && <p className="rounded-[20px] border border-[#dce6ee] bg-white px-6 py-7 text-center text-[#a9532f]">Unable to load the user list.</p>}
            {usersStatus === 'success' && <UserRows users={users} emptyMessage="No users have been added yet." onEdit={handleEdit} onDelete={handleDelete} />}
          </div>
        )}
      </div>
    </section>
  )
}

function UserRows({ users, emptyMessage, onEdit, onDelete }) {
  if (!users.length) return <p className="rounded-[20px] border border-[#dce6ee] bg-white px-6 py-7 text-center text-[#617286]">{emptyMessage}</p>

  return (
    <div className="grid gap-2.5">
      {users.map((user) => (
        <article className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3.5 rounded-xl border border-[#dce6ee] bg-[#f7fafc] p-3.5 transition hover:border-[#9bcddd] hover:shadow-[0_8px_20px_rgba(23,35,55,0.07)] max-[520px]:grid-cols-[auto_minmax(0,1fr)]" key={user.id}>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-[#172337] font-bold text-[#b8e95d]">{user.name.charAt(0)}</div>
          <div className="grid min-w-0 gap-[3px]">
            <strong className="overflow-hidden text-ellipsis whitespace-nowrap text-[#172337]">{user.name}</strong>
            <span className="overflow-hidden text-ellipsis whitespace-nowrap text-[0.85rem] text-[#617286]">{user.email}</span>
          </div>
          <span className="rounded-full bg-[#e4f5b8] px-2.5 py-[5px] text-[0.75rem] font-bold text-[#365316] max-[520px]:col-start-2 max-[520px]:justify-self-start">{user.role}</span>
          {user.accountStatus && <span className="rounded-full bg-[#d9f3e5] px-2.5 py-[5px] text-[0.75rem] font-bold text-[#26734d] max-[520px]:col-start-2 max-[520px]:justify-self-start">{user.accountStatus}</span>}
          <div className="grid grid-cols-2 gap-2 max-[520px]:col-start-2 max-[520px]:justify-start">
            <button className="rounded-[7px] border border-[#c9d6e2] bg-white px-2.5 py-[7px] text-[0.78rem] font-bold text-[#172337] hover:border-[#2aa7c9] hover:text-[#1687a8]" type="button" onClick={() => onEdit(user)}>Edit</button>
            <button className="rounded-[7px] border border-[#c9d6e2] bg-white px-2.5 py-[7px] text-[0.78rem] font-bold text-[#172337] hover:border-[#e17070] hover:text-[#bd4141]" type="button" onClick={() => onDelete(user)}>Delete</button>
          </div>
        </article>
      ))}
    </div>
  )
}

export default AppUser
