// מוצג מיד בזמן שהשרת שולף את הפניות, ומאפשר prefetch חלקי של העמוד
export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-10 animate-pulse">
      <div className="h-11 w-48 rounded-2xl bg-white/60 mb-7" />
      <div className="h-11 w-96 max-w-full rounded-2xl bg-white/60 mb-6" />
      <div className="space-y-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[72px] rounded-2xl glass-panel" />
        ))}
      </div>
    </div>
  )
}
