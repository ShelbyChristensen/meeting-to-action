import { useEffect, useState } from 'react'
import api from '../lib/api'
import { errMsg } from '../lib/errors'

export default function MyItems() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('')
  const [dueBefore, setDueBefore] = useState('')

  const load = async () => {
    try {
      const params = {}
      if (status) params.status = status
      if (dueBefore) params.due_before = dueBefore
      const { data } = await api.get('/action-items', { params })
      setItems(data.items)
    } catch (e) {
      alert(errMsg(e))
    }
  }

  useEffect(() => { load() }, [])

  return (
    <div style={{maxWidth:800, margin:'20px auto'}}>
      <h2>My Items</h2>
      <div style={{display:'flex', gap:8}}>
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="done">Done</option>
        </select>
        <input
          placeholder="Due before (YYYY-MM-DD)"
          value={dueBefore}
          onChange={e=>setDueBefore(e.target.value)}
        />
        <button onClick={load}>Apply</button>
      </div>

      <ul>
        {items.map(it => (
          <li
            key={it.id}
            style={{padding:'6px 0', borderBottom:'1px solid #eee'}}
          >
            #{it.id} — {it.title} — {it.status}{' '}
            {it.due_date ? `(due ${it.due_date})` : ''}

            
            <button
              onClick={async () => {
                const title = prompt('New title:', it.title); if (!title) return
                const due = prompt('New due date (YYYY-MM-DD) or blank:', it.due_date || '')
                try {
                  await api.patch(`/action-items/${it.id}`, {
                    title,
                    due_date: due || null
                  })
                  load()
                } catch (e) {
                  alert(errMsg(e))
                }
              }}
              style={{ marginLeft: 8 }}
            >
              Edit
            </button>

            
            <button
              onClick={async () => {
                if (!confirm('Delete this item?')) return
                try {
                  await api.delete(`/action-items/${it.id}`)
                  load()
                } catch (e) {
                  alert(errMsg(e))
                }
              }}
              style={{ color: 'red', marginLeft: 8 }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
