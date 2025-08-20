import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const nav = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(email, password)
      nav('/meetings')
    } catch (e) {
      setError('Invalid credentials')
    }
  }

  return (
    <div style={{maxWidth:400, margin:'40px auto'}}>
      <h2>Login</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
      {error && <div style={{color:'red'}}>{error}</div>}
      <p>New here? <Link to="/register">Create an account</Link></p>
    </div>
  )
}
