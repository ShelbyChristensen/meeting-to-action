import { useState } from 'react'

export default function MeetingForm({ onCreate }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!title || !date) return
    await onCreate({ title, date })
    setTitle(''); setDate('')
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2">
      <input
        className="flex-1 min-w-[14rem]"
        placeholder="Meeting title"
        value={title}
        onChange={e=>setTitle(e.target.value)}
      />
      <input
        className="w-44"
        type="date"
        value={date}
        onChange={e=>setDate(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  )
}
