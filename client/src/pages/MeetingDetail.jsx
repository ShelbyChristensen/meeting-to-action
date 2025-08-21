import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import { errMsg } from '../lib/errors'

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


  const addItem = async () => {
    const title = prompt('Action item title?'); if (!title) return
    const due = prompt('Due date (YYYY-MM-DD) or blank')
    try {
      await api.post('/action-items', { meeting_id: Number(id), title, due_date: due || null })
      load()
    } catch (e) {
      alert(errMsg(e))
    }
  }

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

  if (!meeting) return <div style={{padding:16}}>Loading…</div>

  return (
    <div style={{maxWidth:800, margin:'20px auto'}}>
      <div style={{display:'flex', alignItems:'center', gap:8}}>
        <h2 style={{marginRight:'auto'}}>{meeting.title} — {meeting.date}</h2>
        <button onClick={editMeeting}>Edit</button>
        <button onClick={deleteMeeting} style={{color:'red'}}>Delete</button>
      </div>

      <p><strong>Attendees:</strong> {meeting.attendees || '-'}</p>
      <p><strong>Notes:</strong> {meeting.notes || '-'}</p>

      <h3 style={{marginTop:20}}>Action Items</h3>
      <button onClick={addItem}>+ Add</button>
      <ul>
        {items.map(it => (
          <li key={it.id} style={{padding:'6px 0', borderBottom:'1px solid #eee', display:'flex', alignItems:'center', gap:8}}>
            <input type="checkbox" checked={it.status === 'done'} onChange={()=>toggle(it)} />
            <span style={{flex:1}}>
              {it.title} {it.due_date ? `(due ${it.due_date})` : ''} — {it.status}
            </span>
            <button onClick={() => editItem(it)}>Edit</button>
            <button onClick={() => deleteItem(it)} style={{color:'red'}}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
