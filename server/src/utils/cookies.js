import { env } from '../config/env.js'

export function setAuthCookies(res, { accessToken, refreshToken }) {
  const base = {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    signed: false,
    domain: env.COOKIE_DOMAIN || undefined,
    path: '/',
  }

  res.cookie('accessToken', accessToken, { ...base, maxAge: 15 * 60 * 1000 })
  res.cookie('refreshToken', refreshToken, { ...base, maxAge: 30 * 24 * 60 * 60 * 1000 })
}

export function clearAuthCookies(res) {
  res.clearCookie('accessToken', { path: '/' })
  res.clearCookie('refreshToken', { path: '/' })
}
