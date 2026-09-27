export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-10 animate-pulse">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-9 h-9 rounded-xl bg-white/60" />
        <div className="h-7 w-40 rounded-xl bg-white/60" />
      </div>
      <div className="glass-panel rounded-2xl p-4 space-y-4 min-h-[300px]">
        <div className="h-14 w-2/3 rounded-2xl bg-white/70" />
        <div className="h-14 w-1/2 rounded-2xl bg-white/70 mr-auto" />
        <div className="h-14 w-3/5 rounded-2xl bg-white/70" />
      </div>
    </div>
  )
}
