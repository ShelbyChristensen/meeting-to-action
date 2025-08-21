import { useState } from 'react'


export default function ActionItemForm({
  initial = {},
  onSubmit,
  onCancel,
  submitLabel = 'Add'
}) {
  const [title, setTitle] = useState(initial.title || '')
  const [due, setDue] = useState(initial.due_date || '')
  const [assignee, setAssignee] = useState(initial.assignee || '')
  const [status, setStatus] = useState(initial.status || 'open')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!title.trim()) { setErr('Title is required'); return }
    const payload = {
      title: title.trim(),
      due_date: due ? due.trim() : null,
      assignee: assignee || undefined,
      status
    }
    setLoading(true)
    try {
      await onSubmit(payload)
    } catch (e) {
      setErr(e?.message || 'Error saving item')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'border rounded px-3 py-2 w-full'
  const labelCls = 'text-sm font-medium'
  const btnCls = 'px-3 py-2 rounded border'

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
      <div className="md:col-span-2">
        <label className={labelCls}>Title</label>
        <input className={inputCls} value={title} onChange={e=>setTitle(e.target.value)} placeholder="Follow up with Alice" />
      </div>
      <div>
        <label className={labelCls}>Due (YYYY-MM-DD)</label>
        <input className={inputCls} value={due} onChange={e=>setDue(e.target.value)} placeholder="2025-08-20" />
      </div>
      <div>
        <label className={labelCls}>Assignee</label>
        <input className={inputCls} value={assignee} onChange={e=>setAssignee(e.target.value)} placeholder="Alice" />
      </div>
      <div>
        <label className={labelCls}>Status</label>
        <select className={inputCls} value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="open">open</option>
          <option value="done">done</option>
        </select>
      </div>
      <div className="flex gap-2 md:col-span-5">
        <button type="submit" disabled={loading} className={`${btnCls} bg-black text-white`}>
          {loading ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className={btnCls} onClick={onCancel}>Cancel</button>
        )}
      </div>
      {err && <div className="text-red-600 text-sm md:col-span-5">{err}</div>}
    </form>
  )
}
