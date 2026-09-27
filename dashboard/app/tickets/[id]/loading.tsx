export default function Loading() {
  return (
    <div className="max-w-3xl mx-auto h-dvh md:px-4 md:py-6 flex flex-col animate-pulse">
      <div className="flex-1 flex flex-col glass-panel md:rounded-3xl overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 bg-white/90 border-b border-gray-200/60">
          <div className="w-9 h-9 rounded-full bg-gray-100" />
          <div className="w-10 h-10 rounded-full bg-gray-100" />
          <div className="h-4 w-36 rounded bg-gray-100" />
        </div>
        <div className="flex-1 chat-wallpaper flex flex-col justify-end gap-3 px-6 py-4">
          <div className="h-12 w-2/3 rounded-2xl bg-white/80" />
          <div className="h-12 w-1/2 rounded-2xl bg-white/70 mr-auto" />
          <div className="h-12 w-3/5 rounded-2xl bg-white/80" />
        </div>
        <div className="h-[84px] bg-white/90 border-t border-gray-200/60" />
      </div>
    </div>
  )
}
