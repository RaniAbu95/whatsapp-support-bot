const SESSION_COOKIE = 'dashboard_session'
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000 // שבוע

async function hmacHex(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

export async function createSessionToken(secret: string): Promise<string> {
  const exp = String(Date.now() + SESSION_TTL_MS)
  return `${exp}.${await hmacHex(exp, secret)}`
}

export async function verifySessionToken(token: string, secret: string): Promise<boolean> {
  try {
    const [exp, sig] = token.split('.')
    if (!exp || !sig) return false
    if (Date.now() > Number(exp)) return false
    return (await hmacHex(exp, secret)) === sig
  } catch {
    return false
  }
}

export { SESSION_COOKIE, SESSION_TTL_MS }
