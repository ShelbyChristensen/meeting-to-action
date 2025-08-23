import { Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Meetings from './pages/Meetings'
import MeetingDetail from './pages/MeetingDetail'
import MyItems from './pages/MyItems'
import Dashboard from './pages/Dashboard'
import CalendarView from './pages/CalendarView'

export default function App() {
  return (
    <>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/meetings"
          element={
            <ProtectedRoute><Meetings /></ProtectedRoute>
          }
        />
        <Route
          path="/meetings/:id"
          element={
            <ProtectedRoute><MeetingDetail /></ProtectedRoute>
          }
        />
        <Route
          path="/my-items"
          element={
            <ProtectedRoute><MyItems /></ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          }
        />
        <Route
          path="/calendar"
          element={
            <ProtectedRoute><CalendarView /></ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}
