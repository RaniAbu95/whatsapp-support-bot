// מוצג מיד בזמן שהשרת שולף את הפניות, ומאפשר prefetch חלקי של העמוד
export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-10 animate-pulse">
      <div className="h-11 w-48 rounded-2xl bg-white/60 mb-6" />
      <div className="glass-panel rounded-3xl overflow-hidden">
        <div className="h-[58px] border-b border-gray-200/60" />
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3.5 px-5 py-3.5 border-b border-gray-200/50">
            <div className="w-12 h-12 rounded-full bg-white/80 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-32 rounded bg-white/80" />
              <div className="h-3 w-2/3 rounded bg-white/70" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
