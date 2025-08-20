import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()
  const nav = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(email, password)
      nav('/meetings')
    } catch (e) {
      setError('Email already registered or invalid')
    }
  }

  return (
    <div style={{maxWidth:400, margin:'40px auto'}}>
      <h2>Register</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input placeholder="Password" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Create account</button>
      </form>
      {error && <div style={{color:'red'}}>{error}</div>}
      <p>Already have an account? <Link to="/login">Sign in</Link></p>
    </div>
  )
}
