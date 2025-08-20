import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Header() {
  const { user, logout } = useAuth()
  return (
    <header style={{display:'flex',gap:12,padding:12,borderBottom:'1px solid #eee'}}>
      <Link to="/meetings"><strong>Meeting-to-Action</strong></Link>
      {user && (
        <>
          <Link to="/meetings">Meetings</Link>
          <Link to="/my-items">My Items</Link>
          <span style={{marginLeft:'auto'}}>{user.email}</span>
          <button onClick={logout}>Logout</button>
        </>
      )}
      {!user && <Link style={{marginLeft:'auto'}} to="/login">Login</Link>}
    </header>
  )
}
