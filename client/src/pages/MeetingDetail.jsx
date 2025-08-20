import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import { errMsg } from '../lib/errors'


export default function MeetingDetail() {
  const { id } = useParams()
  const [meeting, setMeeting] = useState(null)
  const [items, setItems] = useState([])

  const load = async () => {
  try {
    const m = await api.get(`/meetings/${id}`)
    setMeeting(m.data)
    const ai = await api.get('/action-items', { params: {} })
    setItems(ai.data.items.filter(x => x.meeting_id === Number(id)))
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


  if (!meeting) return <div className="p-6">Loading…</div>

  return (
    <div style={{maxWidth:800, margin:'20px auto'}}>
      <h2>{meeting.title} — {meeting.date}</h2>
      <p><strong>Attendees:</strong> {meeting.attendees || '-'}</p>
      <p><strong>Notes:</strong> {meeting.notes || '-'}</p>

      <h3 style={{marginTop:20}}>Action Items</h3>
      <button onClick={addItem}>+ Add</button>
      <ul>
        {items.map(it => (
          <li key={it.id} style={{padding:'6px 0', borderBottom:'1px solid #eee'}}>
            <input type="checkbox" checked={it.status === 'done'} onChange={()=>toggle(it)} />{' '}
            {it.title} {it.due_date ? `(due ${it.due_date})` : ''} — {it.status}
          </li>
        ))}
      </ul>
    </div>
  )
}
