import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Link } from 'react-router-dom'
import { errMsg } from '../lib/errors'
import MeetingForm from '../components/MeetingForm'  

export default function Meetings() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showCreate, setShowCreate] = useState(false) 
  const [editingId, setEditingId] = useState(null)     

  const load = async (p = 1, query = '') => {
    try {
      const { data } = await api.get('/meetings', { params: { page: p, per_page: 10, q: query } })
      setItems(data.items); setPage(data.page); setTotalPages(data.pages)
    } catch (e) {
      alert(errMsg(e))
    }
  }

  useEffect(() => { load(1, '') }, [])

  const createMeeting = async (payload) => {
    try {
      await api.post('/meetings', payload)
      setShowCreate(false)
      load(1, q)
    } catch (e) {
      alert(errMsg(e))
      throw e
    }
  }

  const updateMeeting = async (id, payload) => {
    try {
      await api.patch(`/meetings/${id}`, payload)
      setEditingId(null)
      load(page, q)
    } catch (e) {
      alert(errMsg(e))
      throw e
    }
  }

  const deleteMeeting = async (m) => {
    if (!confirm('Delete this meeting?')) return
    try {
      await api.delete(`/meetings/${m.id}`)
      load(1, q)
    } catch (e) {
      alert(errMsg(e))
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Search meetings…"
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
        <button onClick={()=>load(1, q)} className="px-3 py-2 border rounded">Search</button>
        <button onClick={()=>setShowCreate(s=>!s)} className="ml-auto px-3 py-2 border rounded">
          {showCreate ? 'Close' : '+ New'}
        </button>
      </div>

      {showCreate && (
        <div className="p-3 border rounded">
          <MeetingForm compact submitLabel="Create" onSubmit={createMeeting} onCancel={()=>setShowCreate(false)} />
        </div>
      )}

      <ul className="divide-y">
        {items.map(m => (
          <li key={m.id} className="py-3">
            {editingId === m.id ? (
              <MeetingForm
                initial={{ title: m.title, date: m.date, attendees: m.attendees, notes: m.notes }}
                submitLabel="Save"
                onSubmit={(payload)=>updateMeeting(m.id, payload)}
                onCancel={()=>setEditingId(null)}
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="truncate">
                  <Link to={`/meetings/${m.id}`} className="font-medium hover:underline">
                    {m.title}
                  </Link>{' '}
                  — {m.date}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={()=>setEditingId(m.id)} className="px-3 py-2 border rounded">Edit</button>
                  <button onClick={()=>deleteMeeting(m)} className="px-3 py-2 border rounded text-red-600">Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 pt-2">
        <button disabled={page<=1} onClick={()=>load(page-1,q)} className="px-3 py-2 border rounded disabled:opacity-50">Prev</button>
        <span>Page {page} / {totalPages}</span>
        <button disabled={page>=totalPages} onClick={()=>load(page+1,q)} className="px-3 py-2 border rounded disabled:opacity-50">Next</button>
      </div>
    </div>
  )
}
