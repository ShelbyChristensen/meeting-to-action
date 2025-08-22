import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'
import api from '../lib/api'
import { errMsg } from '../lib/errors'
import Spinner from '../components/Spinner'
import Alert from '../components/Alert'

function ymd(d) {
  // return YYYY-MM-DD for any Date
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export default function CalendarView() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [meetings, setMeetings] = useState([])            // {id,title,date,...}
  const [items, setItems] = useState([])                  // action items
  const [value, setValue] = useState(new Date())          // selected date
  const navigate = useNavigate()

  // fetch meetings + action items (first page up to 200 results)
  const load = async () => {
    setLoading(true); setError('')
    try {
      const [mRes, openRes, doneRes] = await Promise.all([
        api.get('/meetings', { params: { page: 1, per_page: 200 } }),
        api.get('/action-items', { params: { status: 'open', page: 1, per_page: 200 } }),
        api.get('/action-items', { params: { status: 'done', page: 1, per_page: 200 } }),
      ])
      setMeetings(mRes.data.items || [])
      setItems([...(openRes.data.items || []), ...(doneRes.data.items || [])])
    } catch (e) {
      setError(errMsg(e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  // Map dates → meetings / due items
  const meetingByDate = useMemo(() => {
    const map = {}
    for (const m of meetings) {
      const k = m.date
      if (!map[k]) map[k] = []
      map[k].push(m)
    }
    return map
  }, [meetings])

  const itemsByDue = useMemo(() => {
    const map = {}
    for (const it of items) {
      if (!it.due_date) continue
      const k = it.due_date
      if (!map[k]) map[k] = []
      map[k].push(it)
    }
    return map
  }, [items])

  // Calendar tile content: dots if anything is scheduled/due
  const tileContent = ({ date, view }) => {
    if (view !== 'month') return null
    const key = ymd(date)
    const hasMeeting = !!meetingByDate[key]
    const hasDue = !!itemsByDue[key]
    if (!hasMeeting && !hasDue) return null

    return (
      <div className="mt-1 flex gap-1 justify-center">
        {hasMeeting && <span className="inline-block w-2 h-2 rounded-full bg-blue-600" />}
        {hasDue && <span className="inline-block w-2 h-2 rounded-full bg-amber-500" />}
      </div>
    )
  }

  const selectedKey = ymd(value)
  const todaysMeetings = meetingByDate[selectedKey] || []
  const todaysDueItems = itemsByDue[selectedKey] || []

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-4">Calendar</h2>

      {error && <Alert>{error}</Alert>}
      {loading ? (
        <Spinner label="Loading calendar…" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar */}
          <div className="bg-white p-3 rounded border">
            <Calendar
              onChange={setValue}
              value={value}
              tileContent={tileContent}
              calendarType="gregory"
              prev2Label={null}
              next2Label={null}
            />
            <div className="text-xs text-gray-600 mt-2 flex gap-3">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600 inline-block" /> Meeting
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Item due
              </span>
            </div>
          </div>

          {/* Day detail */}
          <div className="space-y-4">
            <div className="border rounded p-3 bg-white">
              <h3 className="font-medium mb-2">Meetings on {selectedKey}</h3>
              {todaysMeetings.length === 0 ? (
                <p className="text-sm text-gray-600">No meetings.</p>
              ) : (
                <ul className="space-y-2">
                  {todaysMeetings.map(m => (
                    <li key={m.id} className="flex items-center justify-between">
                      <span className="truncate">{m.title}</span>
                      <button
                        className="text-blue-600 hover:underline ml-2"
                        onClick={() => navigate(`/meetings/${m.id}`)}
                      >
                        Open
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="border rounded p-3 bg-white">
              <h3 className="font-medium mb-2">Items due on {selectedKey}</h3>
              {todaysDueItems.length === 0 ? (
                <p className="text-sm text-gray-600">No due items.</p>
              ) : (
                <ul className="space-y-2">
                  {todaysDueItems.map(it => (
                    <li key={it.id} className="text-sm">
                      #{it.id} — {it.title} <span className="text-gray-500">({it.status})</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
