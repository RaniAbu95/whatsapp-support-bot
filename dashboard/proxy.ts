import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from './app/lib/auth'

// עמודים ציבוריים — privacy חייב להישאר פתוח (דרישה של Meta), / הוא דף הנחיתה
const PUBLIC_PATHS = ['/login', '/privacy']

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/' || PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    // נציג מחובר שנכנס ל-login מועבר ישר לדשבורד
    if (pathname === '/login' && (await isAuthenticated(request))) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    return NextResponse.next()
  }

  // תאימות לכתובת הישנה של דף הנחיתה
  if (pathname === '/landing') {
    return NextResponse.redirect(new URL('/', request.url), 308)
  }

  if (await isAuthenticated(request)) {
    return NextResponse.next()
  }

  return NextResponse.redirect(new URL('/login', request.url))
}

async function isAuthenticated(request: NextRequest) {
  const secret = process.env.DASHBOARD_PASSWORD
  const token = request.cookies.get(SESSION_COOKIE)?.value
  return Boolean(secret && token && (await verifySessionToken(token, secret)))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
