import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../lib/api'
import { errMsg } from '../lib/errors'
import ActionItemForm from '../components/ActionItemForm'

export default function MeetingDetail() {
  const { id } = useParams()
  const nav = useNavigate()
  const [meeting, setMeeting] = useState(null)
  const [items, setItems] = useState([])

  const load = async () => {
    try {
      const m = await api.get(`/meetings/${id}`)
      setMeeting(m.data)
      const ai = await api.get('/action-items')
      setItems(ai.data.items.filter(x => x.meeting_id === Number(id)))
    } catch (e) {
      alert(errMsg(e))
    }
  }

  useEffect(() => { load() }, [id])

  // ---- Meeting actions ----
  const editMeeting = async () => {
    const title = prompt('Title:', meeting?.title || '')
    if (!title) return
    const date = prompt('Date (YYYY-MM-DD):', meeting?.date || '')
    if (!date) return
    try {
      await api.patch(`/meetings/${id}`, { title, date })
      load()
    } catch (e) {
      alert(errMsg(e))
    }
  }

  const deleteMeeting = async () => {
    if (!confirm('Delete this meeting? All its action items will be removed.')) return
    try {
      await api.delete(`/meetings/${id}`)
      nav('/meetings')
    } catch (e) {
      alert(errMsg(e))
    }
  }

  // ---- Item actions ----
  const toggle = async (item) => {
    try {
      await api.patch(`/action-items/${item.id}`, { status: item.status === 'open' ? 'done' : 'open' })
      load()
    } catch (e) {
      alert(errMsg(e))
    }
  }

  const editItem = async (it) => {
    const title = prompt('New title:', it.title); if (!title) return
    const due = prompt('New due date (YYYY-MM-DD) or blank for none:', it.due_date || '')
    const payload = { title, due_date: due ? due : null }
    try {
      await api.patch(`/action-items/${it.id}`, payload)
      load()
    } catch (e) {
      alert(errMsg(e))
    }
  }

  const deleteItem = async (it) => {
    if (!confirm('Delete this item?')) return
    try {
      await api.delete(`/action-items/${it.id}`)
      load()
    } catch (e) {
      alert(errMsg(e))
    }
  }

  if (!meeting) return <div className="max-w-3xl mx-auto p-6">Loading…</div>

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-semibold mr-auto">
          {meeting.title} — {meeting.date}
        </h2>
        <button onClick={editMeeting}>Edit</button>
        <button onClick={deleteMeeting} className="text-red-600">Delete</button>
      </div>

      <div className="space-y-1">
        <p><span className="font-medium">Attendees:</span> {meeting.attendees || '-'}</p>
        <p><span className="font-medium">Notes:</span> {meeting.notes || '-'}</p>
        <Link to="/meetings" className="text-sm underline">← Back to meetings</Link>
      </div>

      {/* Action Items header + inline add form */}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">Action Items</h3>
        <ActionItemForm onAdd={async ({ title, due_date })=>{
          try {
            await api.post('/action-items', { meeting_id: Number(id), title, due_date })
            load()
          } catch (e) {
            alert(errMsg(e))
          }
        }} />
      </div>

      <ul className="divide-y">
        {items.map(it => (
          <li key={it.id} className="py-2 flex items-center gap-2">
            <input
              type="checkbox"
              checked={it.status === 'done'}
              onChange={()=>toggle(it)}
            />
            <span className="flex-1">
              {it.title} {it.due_date ? `(due ${it.due_date})` : ''} — {it.status}
            </span>
            <button onClick={() => editItem(it)}>Edit</button>
            <button onClick={() => deleteItem(it)} className="text-red-600">Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
