import { useState } from 'react'


export default function MeetingForm({
  initial = {},
  onSubmit,
  onCancel,
  submitLabel = 'Create',
  compact = false
}) {
  const [title, setTitle] = useState(initial.title || '')
  const [date, setDate] = useState(initial.date || '')
  const [attendees, setAttendees] = useState(initial.attendees || '')
  const [notes, setNotes] = useState(initial.notes || '')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    if (!title.trim()) { setErr('Title is required'); return }
    if (!date.trim()) { setErr('Date is required (YYYY-MM-DD)'); return }

    setLoading(true)
    try {
      await onSubmit({ title: title.trim(), date: date.trim(), attendees, notes })
    } catch (e) {
      setErr(e?.message || 'Error saving meeting')
    } finally {
      setLoading(false)
    }
  }

  const wrap = compact ? 'grid grid-cols-1 md:grid-cols-4 gap-2 items-end' : 'space-y-3'
  const field = compact ? 'w-full' : 'w-full'
  const labelCls = 'text-sm font-medium'
  const inputCls = 'border rounded px-3 py-2 w-full'
  const btnCls = 'px-3 py-2 rounded border'

  return (
    <form onSubmit={submit} className={wrap}>
      <div className={compact ? '' : ''}>
        <label className={labelCls}>Title</label>
        <input className={inputCls} value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g., Project Kickoff" />
      </div>
      <div>
        <label className={labelCls}>Date (YYYY-MM-DD)</label>
        <input className={inputCls} value={date} onChange={e=>setDate(e.target.value)} placeholder="2025-08-14" />
      </div>
      {!compact && (
        <div>
          <label className={labelCls}>Attendees</label>
          <input className={inputCls} value={attendees} onChange={e=>setAttendees(e.target.value)} placeholder="Alice, Bob" />
        </div>
      )}
      {!compact && (
        <div>
          <label className={labelCls}>Notes</label>
          <textarea className={inputCls} rows={3} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Agenda, decisions, etc." />
        </div>
      )}

      <div className={compact ? 'flex gap-2' : 'flex gap-2'}>
        <button type="submit" disabled={loading} className={`${btnCls} bg-black text-white`}>
          {loading ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className={btnCls} onClick={onCancel}>Cancel</button>
        )}
      </div>

      {err && <div className="text-red-600 text-sm col-span-full">{err}</div>}
    </form>
  )
}
