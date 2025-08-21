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
  const [editingId, setEditingId] = useState(null)
  const [editDraft, setEditDraft] = useState({ title: '', date: '' })

  const load = async (p = 1, query = '') => {
    try {
      const { data } = await api.get('/meetings', { params: { page: p, per_page: 10, q: query } })
      setItems(data.items); setPage(data.page); setTotalPages(data.pages)
    } catch (e) {
      alert(errMsg(e))
    }
  }

  useEffect(() => { load(1, '') }, [])

  const beginEdit = (m) => {
    setEditingId(m.id)
    setEditDraft({ title: m.title, date: m.date })
  }
  const cancelEdit = () => { setEditingId(null); setEditDraft({ title: '', date: '' }) }

  const saveEdit = async (id) => {
    try {
      if (!editDraft.title || !editDraft.date) return
      await api.patch(`/meetings/${id}`, { title: editDraft.title, date: editDraft.date })
      cancelEdit()
      load(page, q)
    } catch (e) {
      alert(errMsg(e))
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

      {/* Search row */}
      <div className="flex gap-2">
        <input
          className="flex-1"
          placeholder="Search meetings…"
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
        <button onClick={()=>load(1, q)}>Search</button>
      </div>

      {/* Inline create meeting form */}
      <MeetingForm onCreate={async ({ title, date }) => {
        try {
          await api.post('/meetings', { title, date })
          load(1, q)
        } catch (e) {
          alert(errMsg(e))
        }
      }} />

      <ul className="divide-y">
        {items.map(m => (
          <li key={m.id} className="py-3">
            {editingId === m.id ? (
              <div className="flex items-center gap-2">
                <input
                  className="flex-1 min-w-[10rem]"
                  value={editDraft.title}
                  onChange={e=>setEditDraft(d => ({ ...d, title: e.target.value }))}
                  placeholder="Title"
                />
                <input
                  className="w-44"
                  type="date"
                  value={editDraft.date}
                  onChange={e=>setEditDraft(d => ({ ...d, date: e.target.value }))}
                />
                <button onClick={()=>saveEdit(m.id)}>Save</button>
                <button onClick={cancelEdit} className="text-red-600">Cancel</button>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <span className="truncate">
                  <Link to={`/meetings/${m.id}`} className="font-medium hover:underline">
                    {m.title}
                  </Link>{' '}
                  — {m.date}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={()=>beginEdit(m)}>Edit</button>
                  <button onClick={()=>deleteMeeting(m)} className="text-red-600">Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 pt-2">
        <button disabled={page<=1} onClick={()=>load(page-1,q)}>Prev</button>
        <span>Page {page} / {totalPages}</span>
        <button disabled={page>=totalPages} onClick={()=>load(page+1,q)}>Next</button>
      </div>
    </div>
  )
}
