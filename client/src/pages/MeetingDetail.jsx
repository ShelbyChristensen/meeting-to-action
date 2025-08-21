import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../lib/api'
import { errMsg } from '../lib/errors'
import ActionItemForm from '../components/ActionItemForm'  

export default function MeetingDetail() {
  const { id } = useParams()
  const [meeting, setMeeting] = useState(null)
  const [items, setItems] = useState([])
  const [adding, setAdding] = useState(false)      
  const [editingId, setEditingId] = useState(null)  

  const load = async () => {
    try {
      const { data } = await api.get(`/meetings/${id}`)
      
      setMeeting(data)
      const { data: list } = await api.get('/action-items', { params: {} })
  
      setItems(list.items.filter(it => it.meeting_id === Number(id)))
    } catch (e) {
      alert(errMsg(e))
    }
  }

  useEffect(() => { load() }, [id])

  const addItem = async (payload) => {
    try {
      await api.post('/action-items', { meeting_id: Number(id), ...payload })
      setAdding(false)
      load()
    } catch (e) {
      alert(errMsg(e))
      throw e
    }
  }

  const updateItem = async (itemId, payload) => {
    try {
      await api.patch(`/action-items/${itemId}`, payload)
      setEditingId(null)
      load()
    } catch (e) {
      alert(errMsg(e))
      throw e
    }
  }

  const deleteItem = async (itemId) => {
    if (!confirm('Delete this item?')) return
    try {
      await api.delete(`/action-items/${itemId}`)
      load()
    } catch (e) {
      alert(errMsg(e))
    }
  }

  if (!meeting) return <div className="max-w-3xl mx-auto p-6">Loading…</div>

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{meeting.title}</h2>
        <Link to="/meetings" className="text-sm underline">Back</Link>
      </div>
      <div className="text-sm text-gray-600">Date: {meeting.date}</div>
      {meeting.attendees && <div className="text-sm">Attendees: {meeting.attendees}</div>}
      {meeting.notes && <div className="text-sm whitespace-pre-wrap">Notes: {meeting.notes}</div>}

      <hr className="my-2" />

      <div className="flex items-center justify-between">
        <h3 className="font-medium">Action Items</h3>
        <button onClick={()=>setAdding(s=>!s)} className="px-3 py-2 border rounded">
          {adding ? 'Close' : '+ Add Item'}
        </button>
      </div>

      {adding && (
        <div className="p-3 border rounded">
          <ActionItemForm submitLabel="Add" onSubmit={addItem} onCancel={()=>setAdding(false)} />
        </div>
      )}

      <ul className="divide-y">
        {items.map(it => (
          <li key={it.id} className="py-3">
            {editingId === it.id ? (
              <ActionItemForm
                initial={it}
                submitLabel="Save"
                onSubmit={(payload)=>updateItem(it.id, payload)}
                onCancel={()=>setEditingId(null)}
              />
            ) : (
              <div className="flex items-center justify-between">
                <span className="truncate">
                  #{it.id} — {it.title} — {it.status}{' '}
                  {it.due_date ? `(due ${it.due_date})` : ''}
                  {it.assignee ? ` — ${it.assignee}` : ''}
                </span>
                <div className="flex gap-2 shrink-0">
                  <button onClick={()=>setEditingId(it.id)} className="px-3 py-2 border rounded">Edit</button>
                  <button onClick={()=>deleteItem(it.id)} className="px-3 py-2 border rounded text-red-600">Delete</button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
