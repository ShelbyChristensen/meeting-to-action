export default function Empty({ title = 'Nothing here', subtitle }) {
  return (
    <div className="p-6 border rounded text-center text-sm text-gray-600">
      <div className="font-medium text-gray-800">{title}</div>
      {subtitle && <div className="mt-1">{subtitle}</div>}
    </div>
  )
}
