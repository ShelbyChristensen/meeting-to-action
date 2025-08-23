import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../lib/api'
import { errMsg } from '../lib/errors'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'
import Empty from '../components/Empty'

export default function MeetingDetail() {
  const { id } = useParams()

  // meeting & items
  const [meeting, setMeeting] = useState(null)
  const [items, setItems] = useState([])

  // page state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // inline edit (title/date)
  const [editing, setEditing] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDate, setEditDate] = useState('')

  // notes
  const [notesText, setNotesText] = useState('')

  // AI suggestions
  const [aiLoading, setAiLoading] = useState(false)
  const [aiError, setAiError] = useState('')
  const [aiItems, setAiItems] = useState([])       // array of strings
  const [aiSelected, setAiSelected] = useState({}) // { index: boolean }

  // add item form
  const [showAdd, setShowAdd] = useState(false)
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [assignee, setAssignee] = useState('')

  const toggleSelect = (i) =>
    setAiSelected(prev => ({ ...prev, [i]: !prev[i] }))

  const load = async () => {
    setLoading(true); setError('')
    try {
      const [mRes, iRes] = await Promise.all([
        api.get(`/meetings/${id}`),
        api.get('/action-items', { params: { page: 1, per_page: 100 } })
      ])
      setMeeting(mRes.data)
      setNotesText(mRes.data.notes || '')
      setItems(iRes.data.items.filter(it => it.meeting_id === Number(id)))
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id])

  // --- inline edit save ---
  const saveHeader = async (e) => {
    e.preventDefault()
    try {
      await api.patch(`/meetings/${id}`, { title: editTitle, date: editDate })
      const { data } = await api.get(`/meetings/${id}`)
      setMeeting(data)
      setEditing(false)
    } catch (e) {
      alert(errMsg(e))
    }
  }

  // --- notes actions ---
  const saveNotes = async () => {
    try {
      await api.patch(`/meetings/${id}`, { notes: notesText })
      const { data } = await api.get(`/meetings/${id}`)
      setMeeting(data)
      alert('Notes saved.')
    } catch (e) {
      alert(errMsg(e))
    }
  }

  const askAI = async () => {
    const text = (notesText || '').trim()
    if (!text) { alert('No notes to analyze.'); return }
    setAiLoading(true); setAiError('')
    try {
      const { data } = await api.post('/ai/suggest', { notes: text })
      const cleaned = (data.items || [])
        .map(x => x.replace(/^\s*[-*\d\.\)]\s*/, '').trim())
        .filter(Boolean)
      setAiItems(cleaned)
      setAiSelected({})
    } catch (e) {
      setAiError(errMsg(e))
    } finally {
      setAiLoading(false)
    }
  }

  const convertSelected = async () => {
    const chosen = aiItems.map((txt, i) => ({ i, txt })).filter(({ i }) => aiSelected[i])
    if (chosen.length === 0) { alert('Select at least one suggestion.'); return }
    try {
      for (const { txt } of chosen) {
        await api.post('/action-items', {
          meeting_id: Number(id),
          title: txt,
          status: 'open'
        })
      }
      setAiItems([]); setAiSelected({})
      await load()
      alert(`Created ${chosen.length} action item(s).`)
    } catch (e) {
      alert(errMsg(e))
    }
  }

  // --- items actions ---
  const submitNewItem = async (e) => {
    e.preventDefault()
    try {
      if (!title.trim()) return alert('Title is required')
      await api.post('/action-items', {
        meeting_id: Number(id),
        title: title.trim(),
        due_date: due || null,
        assignee: assignee || null,
        status: 'open'
      })
      setTitle(''); setDue(''); setAssignee(''); setShowAdd(false)
      load()
    } catch (e) {
      alert(errMsg(e))
    }
  }

  const toggleStatus = async (it) => {
    try {
      await api.patch(`/action-items/${it.id}`, { status: it.status === 'open' ? 'done' : 'open' })
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

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <Spinner label="Loading meeting…" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      {error && <Alert>{error}</Alert>}

      {!meeting ? (
        <Empty title="Meeting not found" subtitle="Try going back to your meetings list." />
      ) : (
        <>
          {/* Header: inline edit */}
          <div className="border-b pb-3 mb-3">
            {editing ? (
              <form onSubmit={saveHeader} className="space-y-2">
                <input
                  className="w-full border rounded px-3 py-2"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Meeting title"
                />
                <input
                  className="w-full border rounded px-3 py-2"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  placeholder="YYYY-MM-DD"
                />
                <div className="flex gap-2">
                  <button type="submit" className="px-3 py-2 border rounded">Save</button>
                  <button
                    type="button"
                    className="px-3 py-2 border rounded"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{meeting.title}</h2>
                  <div className="text-sm text-gray-600">{meeting.date}</div>
                </div>
                <button
                  className="px-2 py-1 border rounded text-sm"
                  onClick={() => {
                    setEditTitle(meeting.title)
                    setEditDate(meeting.date)
                    setEditing(true)
                  }}
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Notes + AI */}
          <div className="space-y-2">
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              className="w-full min-h-[120px] border rounded px-3 py-2"
              value={notesText}
              onChange={(e)=>setNotesText(e.target.value)}
              placeholder="Type or paste meeting notes here…"
            />
            <div className="flex gap-2">
              <button className="px-3 py-2 border rounded" onClick={saveNotes}>
                Save Notes
              </button>
              <button
                className="px-3 py-2 border rounded bg-blue-50 hover:bg-blue-100 disabled:opacity-60"
                onClick={askAI}
                disabled={aiLoading}
              >
                {aiLoading ? 'Thinking…' : 'AI Suggest'}
              </button>
            </div>

            {(aiError || aiItems.length > 0) && (
              <div className="mt-2 border rounded p-3 bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">AI Suggestions</h4>
                  {aiItems.length > 0 && (
                    <button
                      className="text-sm underline"
                      onClick={() => { setAiItems([]); setAiSelected({}) }}
                      title="Clear suggestions"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {aiError && <div className="text-sm text-red-600">{aiError}</div>}

                {aiItems.length === 0 && !aiError && (
                  <div className="text-sm text-gray-600">
                    No suggestions yet. Click <em>AI Suggest</em> to generate from notes.
                  </div>
                )}

                {aiItems.length > 0 && (
                  <>
                    <ul className="space-y-2">
                      {aiItems.map((txt, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={!!aiSelected[i]}
                            onChange={()=>toggleSelect(i)}
                          />
                          <span>{txt}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="flex justify-end gap-2 mt-3">
                      <button className="px-3 py-2 border rounded" onClick={convertSelected}>
                        Convert to Action Items
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Action Items */}
          <div>
            <h3 className="font-semibold mb-2">Action Items</h3>

            {!showAdd ? (
              <button className="px-3 py-2 border rounded mb-3" onClick={()=>setShowAdd(true)}>+ Add Item</button>
            ) : (
              <form onSubmit={submitNewItem} className="mb-4 border rounded p-3 space-y-3">
                <div className="space-y-1">
                  <label className="block text-sm">Title *</label>
                  <input
                    className="w-full border rounded px-3 py-2"
                    value={title}
                    onChange={e=>setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-sm">Due date (YYYY-MM-DD)</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={due}
                      onChange={e=>setDue(e.target.value)}
                      placeholder="optional"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-sm">Assignee</label>
                    <input
                      className="w-full border rounded px-3 py-2"
                      value={assignee}
                      onChange={e=>setAssignee(e.target.value)}
                      placeholder="optional"
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    className="px-3 py-2 border rounded"
                    onClick={()=>{ setShowAdd(false); setTitle(''); setDue(''); setAssignee('') }}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-3 py-2 border rounded">Create</button>
                </div>
              </form>
            )}

            {items.length === 0 ? (
              <Empty title="No action items" subtitle="Add one with + Add Item." />
            ) : (
              <ul className="divide-y">
                {items.map(it => (
                  <li key={it.id} className="py-3 flex items-center justify-between">
                    <span className="truncate">
                      {it.title} — <span className="italic">{it.status}</span>
                      {it.due_date ? ` (due ${it.due_date})` : ''}
                      {it.assignee ? ` — ${it.assignee}` : ''}
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button className="px-3 py-2 border rounded" onClick={()=>toggleStatus(it)}>
                        {it.status === 'open' ? 'Mark done' : 'Reopen'}
                      </button>
                      <button className="px-3 py-2 border rounded text-red-600" onClick={()=>deleteItem(it)}>
                        Delete
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  )
}
