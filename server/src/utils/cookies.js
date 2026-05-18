import { env } from '../config/env.js'

export function setAuthCookies(res, { accessToken, refreshToken }) {
  const isProd = env.NODE_ENV === 'production'
  const secure = isProd || env.COOKIE_SECURE

  const base = {
    httpOnly: true,
    secure,
    sameSite: secure ? 'none' : 'lax',
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
