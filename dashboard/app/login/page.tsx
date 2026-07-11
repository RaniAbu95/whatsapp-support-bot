import { login } from './actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="text-3xl mb-2">🔐</div>
          <h1 className="text-xl font-bold text-gray-900">כניסת נציגים</h1>
          <p className="text-sm text-gray-500 mt-1">הזן סיסמה כדי לגשת לדשבורד</p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 text-center">
            סיסמה שגויה, נסה שוב
          </div>
        )}

        <form action={login} className="space-y-4">
          <input
            type="password"
            name="password"
            required
            autoFocus
            placeholder="סיסמה"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 text-white py-2.5 text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            התחבר
          </button>
        </form>
      </div>
    </div>
  )
}
