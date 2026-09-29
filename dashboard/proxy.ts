import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from './app/lib/auth'

// עמודים ציבוריים — privacy חייב להישאר פתוח (דרישה של Meta), landing הוא דף הנחיתה
const PUBLIC_PATHS = ['/login', '/privacy', '/landing']

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next()
  }

  const secret = process.env.DASHBOARD_PASSWORD
  const token = request.cookies.get(SESSION_COOKIE)?.value

  if (secret && token && (await verifySessionToken(token, secret))) {
    return NextResponse.next()
  }

  // מבקר לא מחובר בכתובת הראשית רואה את דף הנחיתה, בלי לשנות את ה-URL
  if (pathname === '/') {
    return NextResponse.rewrite(new URL('/landing', request.url))
  }

  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
