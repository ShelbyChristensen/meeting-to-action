export default function Alert({ kind = 'error', children }) {
  const base = 'px-3 py-2 rounded text-sm'
  const styles = {
    error: 'bg-red-50 text-red-700 border border-red-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
    success: 'bg-green-50 text-green-700 border border-green-200',
  }
  return <div className={`${base} ${styles[kind] || styles.error}`}>{children}</div>
}
