import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from './app/lib/auth'

// עמודים ציבוריים — privacy חייב להישאר פתוח (דרישה של Meta)
const PUBLIC_PATHS = ['/login', '/privacy']

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

  return NextResponse.redirect(new URL('/login', request.url))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
