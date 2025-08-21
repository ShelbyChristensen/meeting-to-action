import { useEffect, useState } from 'react'
import api from '../lib/api'
import { errMsg } from '../lib/errors'
import Alert from '../components/Alert'
import Spinner from '../components/Spinner'
import Empty from '../components/Empty'

export default function MyItems() {
  const [items, setItems] = useState([])
  const [status, setStatus] = useState('')
  const [dueBefore, setDueBefore] = useState('')

  const [loading, setLoading] = useState(false) 
  const [error, setError] = useState('')        

  const load = async () => {
    setLoading(true); setError('')
    try {
      const params = {}
      if (status) params.status = status
      if (dueBefore) params.due_before = dueBefore
      const { data } = await api.get('/action-items', { params })
      setItems(data.items)
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) 

  const editItem = async (it) => {
    const title = prompt('New title:', it.title); if (!title) return
    const due = prompt('New due date (YYYY-MM-DD) or blank:', it.due_date || '')
    try {
      await api.patch(`/action-items/${it.id}`, { title, due_date: due || null })
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

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <h2 className="text-xl font-semibold">My Items</h2>

      <div className="flex gap-2">
        <select value={status} onChange={e=>setStatus(e.target.value)} className="border rounded px-3 py-2">
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
        <button onClick={load} className="px-3 py-2 border rounded">Apply</button>
      </div>

      {error && <Alert>{error}</Alert>}

      {loading ? (
        <Spinner label="Loading items…" />
      ) : items.length === 0 ? (
        <Empty title="No items match your filters" subtitle="Try adjusting the status or due date." />
      ) : (
        <ul className="divide-y">
          {items.map(it => (
            <li key={it.id} className="py-3 flex items-center justify-between">
              <span className="truncate">
                #{it.id} — {it.title} — {it.status}{' '}
                {it.due_date ? `(due ${it.due_date})` : ''}
              </span>
              <div className="flex gap-2 shrink-0">
                <button onClick={()=>editItem(it)} className="px-3 py-2 border rounded">Edit</button>
                <button onClick={()=>deleteItem(it)} className="px-3 py-2 border rounded text-red-600">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
