import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Link } from 'react-router-dom'
import { errMsg } from '../lib/errors'

export default function Meetings() {
  const [items, setItems] = useState([])
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = async (p = 1, query = '') => {
    try {
      const { data } = await api.get('/meetings', { params: { page: p, per_page: 10, q: query } })
      setItems(data.items); setPage(data.page); setTotalPages(data.pages)
    } catch (e) {
      alert(errMsg(e))
    }
  }

  useEffect(() => { load(1, '') }, [])

  const create = async (e) => {
    e.preventDefault()
    try {
      const title = prompt('Meeting title?'); if (!title) return
      const date = prompt('Date (YYYY-MM-DD)?'); if (!date) return
      await api.post('/meetings', { title, date })
      load(page, q)
    } catch (e) {
      alert(errMsg(e))
    }
  }

  const editMeeting = async (m) => {
    const newTitle = prompt('New title?', m.title); if (!newTitle) return
    const newDate = prompt('New date (YYYY-MM-DD)?', m.date); if (!newDate) return
    try {
      await api.patch(`/meetings/${m.id}`, { title: newTitle, date: newDate })
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
      <div className="flex gap-2">
        <input
          className="flex-1"
          placeholder="Search meetings…"
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
        <button onClick={()=>load(1, q)}>Search</button>
        <button onClick={create} className="ml-auto">+ New</button>
      </div>

      <ul className="divide-y">
        {items.map(m => (
          <li key={m.id} className="py-3 flex items-center justify-between">
            <span className="truncate">
              <Link to={`/meetings/${m.id}`} className="font-medium hover:underline">
                {m.title}
              </Link>{' '}
              — {m.date}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={()=>editMeeting(m)}>Edit</button>
              <button onClick={()=>deleteMeeting(m)} className="text-red-600">Delete</button>
            </div>
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
