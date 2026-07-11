'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_MS } from '@/app/lib/auth'

export async function login(formData: FormData) {
  const password = formData.get('password')
  const secret = process.env.DASHBOARD_PASSWORD

  if (!secret || typeof password !== 'string' || password !== secret) {
    redirect('/login?error=1')
  }

  const token = await createSessionToken(secret)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_MS / 1000,
  })
  redirect('/')
}

export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  redirect('/login')
}
