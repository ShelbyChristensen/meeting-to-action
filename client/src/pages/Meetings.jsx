import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Link } from 'react-router-dom'
import { errMsg } from '../lib/errors'

export default function Meetings() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // inline add form state
  const [showAdd, setShowAdd] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')

  // inline edit per-row (track id being edited)
  const [editId, setEditId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')

  const load = async (p = 1, query = '') => {
    try {
      const { data } = await api.get('/meetings', { params: { page: p, per_page: 10, q: query } })
      setItems(data.items); setPage(data.page); setTotalPages(data.pages)
    } catch (e) {
      alert(errMsg(e))
    }
  }

  useEffect(() => { load(1, '') }, [])

  // Create meeting (inline form)
  const create = async (e) => {
    e.preventDefault()
    try {
      if (!newTitle.trim()) return alert('Title is required')
      if (!newDate.trim()) return alert('Date is required (YYYY-MM-DD)')
      await api.post('/meetings', { title: newTitle.trim(), date: newDate.trim() })
      setNewTitle(''); setNewDate(''); setShowAdd(false)
      load(page, q)
    } catch (e) {
      alert(errMsg(e))
    }
  }

  // Edit meeting
  const startEdit = (m) => {
    setEditId(m.id)
    setEditTitle(m.title)
    setEditDate(m.date)
  }
  const cancelEdit = () => {
    setEditId(null)
    setEditTitle('')
    setEditDate('')
  }
  const saveEdit = async (m) => {
    try {
      if (!editTitle.trim()) return alert('Title is required')
      if (!editDate.trim()) return alert('Date is required (YYYY-MM-DD)')
      await api.patch(`/meetings/${m.id}`, { title: editTitle.trim(), date: editDate.trim() })
      cancelEdit()
      load(page, q)
    } catch (e) {
      alert(errMsg(e))
    }
  }

  // Delete meeting
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
        <button className="px-3 py-2 border rounded" onClick={()=>load(1, q)}>Search</button>
        {!showAdd ? (
          <button className="px-3 py-2 border rounded ml-auto" onClick={()=>setShowAdd(true)}>+ New</button>
        ) : (
          <button className="px-3 py-2 border rounded ml-auto" onClick={()=>{ setShowAdd(false); setNewTitle(''); setNewDate(''); }}>Cancel</button>
        )}
      </div>

      {/* Inline Add Form */}
      {showAdd && (
        <form onSubmit={create} className="border rounded p-3 space-y-3">
          <div className="space-y-1">
            <label className="block text-sm">Title *</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={newTitle}
              onChange={e=>setNewTitle(e.target.value)}
              placeholder="e.g., Project Kickoff"
            />
          </div>
          <div className="space-y-1">
            <label className="block text-sm">Date (YYYY-MM-DD) *</label>
            <input
              className="w-full border rounded px-3 py-2"
              value={newDate}
              onChange={e=>setNewDate(e.target.value)}
              placeholder="2025-09-01"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="px-3 py-2 border rounded" onClick={()=>{ setShowAdd(false); setNewTitle(''); setNewDate(''); }}>Cancel</button>
            <button type="submit" className="px-3 py-2 border rounded">Create</button>
          </div>
        </form>
      )}

      <ul className="divide-y">
        {items.map(m => (
          <li key={m.id} className="py-3">
            {editId === m.id ? (
              <div className="space-y-2">
                <input
                  className="w-full border rounded px-3 py-2"
                  value={editTitle}
                  onChange={(e)=>setEditTitle(e.target.value)}
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  value={editDate}
                  onChange={(e)=>setEditDate(e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
                <div className="flex gap-2 justify-end">
                  <button className="px-3 py-2 border rounded" onClick={()=>saveEdit(m)}>Save</button>
                  <button className="px-3 py-2 border rounded" onClick={cancelEdit}>Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="truncate">
                  <Link to={`/meetings/${m.id}`} className="font-medium hover:underline">
                    {m.title}
                  </Link>{' '}
                  — {m.date}
                </span>
                <div className="shrink-0 flex gap-2">
                  <button className="px-3 py-2 border rounded" onClick={()=>startEdit(m)}>Edit</button>
                  <button className="px-3 py-2 border rounded text-red-600" onClick={()=>deleteMeeting(m)}>Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2 pt-2">
        <button className="px-3 py-2 border rounded" disabled={page<=1} onClick={()=>load(page-1,q)}>Prev</button>
        <span>Page {page} / {totalPages}</span>
        <button className="px-3 py-2 border rounded" disabled={page>=totalPages} onClick={()=>load(page+1,q)}>Next</button>
      </div>
    </div>
  )
}
