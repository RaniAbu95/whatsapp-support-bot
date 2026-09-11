import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-100 p-8 shadow-xl shadow-indigo-950/5">
        <div className="text-center mb-7">
          <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/25">
            🔐
          </div>
          <h1 className="text-xl font-bold text-gray-900">כניסת נציגים</h1>
          <p className="text-sm text-gray-500 mt-1">הזן סיסמה כדי לגשת לדשבורד</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 border border-red-100 p-3 text-sm text-red-700 text-center">
            סיסמה שגויה, נסה שוב
          </div>
        )}

        <form action={login} className="space-y-3">
          <input
            type="password"
            name="password"
            required
            autoFocus
            placeholder="סיסמה"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm transition-shadow focus:outline-none focus:ring-4 focus:ring-indigo-500/15 focus:border-indigo-400"
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-indigo-600 text-white py-2.5 text-sm font-medium hover:bg-indigo-700 active:scale-[0.99] transition-all shadow-sm shadow-indigo-600/20"
          >
            התחבר
          </button>
        </form>
      </div>
    </div>
  )
}
