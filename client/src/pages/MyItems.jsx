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
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">My Items</h2>
      <div className="flex gap-2">
        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={e=>setStatus(e.target.value)}
        >
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="done">Done</option>
        </select>
        <input
          className="border rounded px-3 py-2"
          placeholder="Due before (YYYY-MM-DD)"
          value={dueBefore}
          onChange={e=>setDueBefore(e.target.value)}
        />
        <button onClick={load}>Apply</button>
      </div>

      <ul className="divide-y">
        {items.map(it => (
          <li key={it.id} className="py-2">
            #{it.id} — {it.title} — {it.status}{' '}
            {it.due_date ? `(due ${it.due_date})` : ''}
          </li>
        ))}
      </ul>
    </div>
  )
}
