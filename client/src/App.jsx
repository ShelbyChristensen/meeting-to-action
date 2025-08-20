import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Register from './pages/Register'
import Meetings from './pages/Meetings'
import MeetingDetail from './pages/MeetingDetail'
import MyItems from './pages/MyItems'

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/meetings" element={
          <ProtectedRoute><Meetings /></ProtectedRoute>
        } />
        <Route path="/meetings/:id" element={
          <ProtectedRoute><MeetingDetail /></ProtectedRoute>
        } />
        <Route path="/my-items" element={
          <ProtectedRoute><MyItems /></ProtectedRoute>
        } />

        <Route path="/" element={<Navigate to="/meetings" replace />} />
      </Routes>
    </>
  )
}
