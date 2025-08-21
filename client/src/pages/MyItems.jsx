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
    <div className="max-w-3xl mx-auto p-6">
      <h2 className="text-2xl font-semibold mb-4">My Items</h2>

      <div className="flex gap-2 mb-4">
        <select
          value={status}
          onChange={e=>setStatus(e.target.value)}
          className="min-w-[8rem]"
        >
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="done">Done</option>
        </select>

        <input
          placeholder="Due before (YYYY-MM-DD)"
          value={dueBefore}
          onChange={e=>setDueBefore(e.target.value)}
          className="flex-1"
        />

        <button onClick={load}>Apply</button>
      </div>

      <ul className="divide-y">
        {items.map(it => (
          <li key={it.id} className="py-2">
            <span>
              #{it.id} — {it.title} — {it.status}{' '}
              {it.due_date ? `(due ${it.due_date})` : ''}
            </span>

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
              className="ml-2"
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
              className="ml-2 text-red-600"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
