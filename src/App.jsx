import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppUser from './components/AppUser.jsx'
import Footer from './components/Footer.jsx'
import Header from './components/Header.jsx'
import Home from './components/Home.jsx'
import Login from './components/Login.jsx'
import SignUp from './components/SignUp.jsx'
import UserData from './components/UserData.jsx'
import './App.css'

function App() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('authUser')

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch {
        localStorage.removeItem('authUser')
        localStorage.removeItem('authToken')
      }
    }
  }, [])

  function handleLogout() {
    localStorage.removeItem('authToken')
    localStorage.removeItem('authUser')
    setUser(null)
  }

  return (
    <div className="app-shell">
      <Header user={user} onLogout={handleLogout} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/data" element={user ? <UserData /> : <Navigate to="/login" replace />} />
          <Route path="/app-user" element={user ? <AppUser /> : <Navigate to="/login" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
