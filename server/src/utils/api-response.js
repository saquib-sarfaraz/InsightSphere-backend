export function ok(res, { data = null, message = 'OK', meta = undefined } = {}) {
  const payload = { success: true, message, data }
  if (meta) payload.meta = meta
  return res.json(payload)
}

