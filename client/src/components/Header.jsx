import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()

  const navCls = ({ isActive }) =>
    `px-3 py-2 rounded ${isActive ? 'bg-[#e6f7fb] text-[#006c80]' : 'hover:bg-gray-100'}`

  return (
    <header className="flex items-center gap-6 px-6 py-4 border-b">
     
      <Link to="/" className="flex items-center gap-4">
        <img
          src="/logo.png"
          alt="Meeting-to-Action logo"
          className="h-48 w-48 object-contain"
        />
      </Link>

      {user && (
        <>
          
          <nav className="flex items-center gap-2">
            <NavLink to="/dashboard" className={navCls}>Dashboard</NavLink>
            <NavLink to="/meetings" className={navCls}>Meetings</NavLink>
            <NavLink to="/my-items" className={navCls}>My Items</NavLink>
            <NavLink to="/calendar" className={navCls}>Calendar</NavLink>
          </nav>

          
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button onClick={logout} className="px-3 py-2 rounded border hover:bg-gray-50">
              Logout
            </button>
          </div>
        </>
      )}

      {!user && (
        <div className="ml-auto">
          <NavLink to="/login" className="px-3 py-2 rounded border hover:bg-gray-50">
            Login
          </NavLink>
        </div>
      )}
    </header>
  )
}
