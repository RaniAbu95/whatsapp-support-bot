export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 animate-pulse">
      <div className="w-9 h-9 rounded-xl bg-white/60 mb-4" />
      <div className="h-9 w-40 rounded-xl bg-white/60 mb-8" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5 mb-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl glass-panel" />
        ))}
      </div>
      <div className="h-36 rounded-2xl glass-panel mb-5" />
      <div className="h-48 rounded-2xl glass-panel" />
    </div>
  )
}
