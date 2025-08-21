import { useState } from 'react'

export default function ActionItemForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    if (!title) return
    await onAdd({ title, due_date: due || null })
    setTitle(''); setDue('')
  }

  return (
    <form onSubmit={submit} className="flex flex-wrap gap-2">
      <input
        className="flex-1 min-w-[14rem]"
        placeholder="Action item title"
        value={title}
        onChange={e=>setTitle(e.target.value)}
      />
      <input
        className="w-44"
        type="date"
        value={due}
        onChange={e=>setDue(e.target.value)}
      />
      <button type="submit">Add</button>
    </form>
  )
}
