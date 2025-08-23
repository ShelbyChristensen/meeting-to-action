import { useEffect, useMemo, useState } from 'react'
import api from '../lib/api'
import { errMsg } from '../lib/errors'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'

export default function Dashboard() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [openCount, setOpenCount] = useState(0)
  const [doneCount, setDoneCount] = useState(0)
  const [dueThisWeek, setDueThisWeek] = useState(0)
  const [meetingsThisMonth, setMeetingsThisMonth] = useState(0)

  const next7 = useMemo(() => {
    const d = new Date()
    d.setDate(d.getDate() + 7)
    return d.toISOString().slice(0,10)
  }, [])

  const yyyymm = useMemo(() => {
    const now = new Date()
    return { y: now.getFullYear(), m: now.getMonth() + 1 }
  }, [])

  const load = async () => {
    setLoading(true); setError('')
    try {
      
      const openRes = await api.get('/action-items', { params: { status: 'open', page: 1, per_page: 100 } })
      setOpenCount(openRes.data.total || openRes.data.items.length)

 
      const doneRes = await api.get('/action-items', { params: { status: 'done', page: 1, per_page: 100 } })
      setDoneCount(doneRes.data.total || doneRes.data.items.length)

      
      const dueRes = await api.get('/action-items', { params: { status: 'open', due_before: next7, page: 1, per_page: 100 } })
      setDueThisWeek(dueRes.data.total || dueRes.data.items.length)

     
      const meetRes = await api.get('/meetings', { params: { page: 1, per_page: 100 } })
      const inMonth = meetRes.data.items.filter(m => {
        const [yy, mm] = (m.date || '').split('-').map(Number)
        return yy === yyyymm.y && mm === yyyymm.m
      }).length
      setMeetingsThisMonth(inMonth)
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const chartData = [
    { name: 'Open', count: openCount },
    { name: 'Done', count: doneCount },
  ]

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">Dashboard</h2>

      {error && <Alert>{error}</Alert>}
      {loading ? (
        <Spinner label="Loading dashboard…" />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Open items" value={openCount} />
            <StatCard label="Done items" value={doneCount} />
            <StatCard label="Due next 7 days" value={dueThisWeek} />
            <StatCard label="Meetings this month" value={meetingsThisMonth} />
          </div>

          <div className="h-64 border rounded p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}

function StatCard({ label, value }) {
  return (
    <div className="border rounded p-3">
      <div className="text-sm text-gray-600">{label}</div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  )
}
