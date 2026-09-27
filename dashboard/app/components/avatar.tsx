const GRADIENTS = [
  'from-indigo-500 to-purple-500',
  'from-sky-500 to-indigo-500',
  'from-purple-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-rose-500 to-pink-500',
]

// צבע קבוע לכל לקוח לפי מספר הטלפון, כדי שיהיה קל לזהות לקוחות חוזרים
function gradientFor(phone: string) {
  let hash = 0
  for (const ch of phone) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0
  return GRADIENTS[hash % GRADIENTS.length]
}

export default function Avatar({
  phone,
  size = 'md',
  dotClassName,
}: {
  phone: string
  size?: 'sm' | 'md'
  dotClassName?: string
}) {
  const dims = size === 'sm' ? 'w-10 h-10' : 'w-12 h-12'
  return (
    <div
      className={`relative ${dims} rounded-full bg-gradient-to-br ${gradientFor(phone)} flex items-center justify-center text-white shrink-0 shadow-sm`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-[55%] h-[55%] opacity-90" aria-hidden="true">
        <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm0 2c-4.14 0-7.5 2.46-7.5 5.5 0 .83.67 1.5 1.5 1.5h12c.83 0 1.5-.67 1.5-1.5 0-3.04-3.36-5.5-7.5-5.5Z" />
      </svg>
      {dotClassName && (
        <span className={`absolute bottom-0 left-0 w-3.5 h-3.5 rounded-full ring-2 ring-white ${dotClassName}`} />
      )}
    </div>
  )
}
