// ============================================================
// NEXO TRADE — dateUtils
// Formateo de fechas/horas para posts y UI
// ============================================================

/**
 * Devuelve tiempo relativo en el idioma indicado
 * Ej: "hace 2 minutos", "2 minutes ago", "il y a 3 heures"
 */
export function timeAgo(dateStr: string, lang: string = 'es'): string {
  const date = new Date(dateStr)
  const now  = new Date()
  const diffMs  = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHr  = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHr  / 24)
  const diffWk  = Math.floor(diffDay / 7)
  const diffMo  = Math.floor(diffDay / 30)
  const diffYr  = Math.floor(diffDay / 365)

  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' })

  if (diffSec < 60)   return rtf.format(-diffSec, 'second')
  if (diffMin < 60)   return rtf.format(-diffMin, 'minute')
  if (diffHr  < 24)   return rtf.format(-diffHr,  'hour')
  if (diffDay < 7)    return rtf.format(-diffDay, 'day')
  if (diffWk  < 5)    return rtf.format(-diffWk,  'week')
  if (diffMo  < 12)   return rtf.format(-diffMo,  'month')
  return rtf.format(-diffYr, 'year')
}

/**
 * Fecha y hora completa formateada
 * Ej: "18 may. 2026, 10:35"
 */
export function formatDateTime(dateStr: string, lang: string = 'es'): string {
  return new Intl.DateTimeFormat(lang, {
    day:    'numeric',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

/**
 * Solo hora
 * Ej: "10:35 AM"
 */
export function formatTime(dateStr: string, lang: string = 'es'): string {
  return new Intl.DateTimeFormat(lang, {
    hour:   '2-digit',
    minute: '2-digit',
  }).format(new Date(dateStr))
}

/**
 * Solo fecha
 * Ej: "18 de mayo de 2026"
 */
export function formatDate(dateStr: string, lang: string = 'es'): string {
  return new Intl.DateTimeFormat(lang, {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  }).format(new Date(dateStr))
}

/**
 * Tooltip: muestra tiempo relativo con tooltip de fecha completa
 * Retorna un objeto { label, title } para usar en <span title={title}>{label}</span>
 */
export function postTimestamp(dateStr: string, lang: string = 'es') {
  return {
    label: timeAgo(dateStr, lang),
    title: formatDateTime(dateStr, lang),
  }
}

/**
 * Semana actual en formato legible
 * Ej: "Semana del 12 al 18 de mayo"
 */
export function currentWeekLabel(lang: string = 'es'): string {
  const now   = new Date()
  const day   = now.getDay()
  const start = new Date(now)
  start.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
  const end   = new Date(start)
  end.setDate(start.getDate() + 6)

  const fmt = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'long' })
  return `${fmt.format(start)} – ${fmt.format(end)}`
}
