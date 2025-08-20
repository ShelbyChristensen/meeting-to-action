import { useEffect, useState } from 'react'
import api from '../lib/api'
import { Link } from 'react-router-dom'
import { errMsg } from '../lib/errors'


export default function Meetings() {
    const [items, setItems] = useState([])
    const [q, setQ] = useState('')
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)

    const load = async (p = 1, query = '') => {
        try {
            const { data } = await api.get('/meetings', { params: { page: p, per_page: 10, q: query } })
            setItems(data.items); setPage(data.page); setTotalPages(data.pages)
        } catch (e) {
            alert(errMsg(e))
        }
    }

    const create = async (e) => {
        e.preventDefault()
        try {
            const title = prompt('Meeting title?'); if (!title) return
            const date = prompt('Date (YYYY-MM-DD)?'); if (!date) return
            await api.post('/meetings', { title, date })
            load(page, q)
        } catch (e) {
            alert(errMsg(e))
        }
    }



    return (
        <div style={{ maxWidth: 800, margin: '20px auto' }}>
            <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="Search meetings…" value={q} onChange={e => setQ(e.target.value)} />
                <button onClick={() => load(1, q)}>Search</button>
                <button onClick={create} style={{ marginLeft: 'auto' }}>+ New</button>
            </div>
            <ul>
                {items.map(m => (
                    <li
                        key={m.id}
                        style={{ padding: '8px 0', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                    >
                        <span>
                            <Link to={`/meetings/${m.id}`}>{m.title}</Link> — {m.date}
                        </span>
                        <button
                            onClick={async () => {
                                if (!confirm('Delete this meeting?')) return
                                try {
                                    await api.delete(`/meetings/${m.id}`)
                                    load(1, q)
                                } catch (e) {
                                    alert(errMsg(e))
                                }
                            }}
                            style={{ color: 'red' }}
                        >
                            Delete
                        </button>

                    </li>
                ))}

            </ul>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button disabled={page <= 1} onClick={() => load(page - 1, q)}>Prev</button>
                <span>Page {page} / {totalPages}</span>
                <button disabled={page >= totalPages} onClick={() => load(page + 1, q)}>Next</button>
            </div>
        </div>
    )
}
