// ============================================================
// NEXO TRADE — Componente: PostTimestamp
// Muestra "hace X minutos" con tooltip de fecha completa
// ============================================================
import { useState, useEffect } from 'react'
import { postTimestamp } from '../lib/dateUtils'
import { useLanguage } from '../context/LanguageContext'

interface PostTimestampProps {
  date:       string
  style?:     React.CSSProperties
  className?: string
}

export default function PostTimestamp({ date, style, className }: PostTimestampProps) {
  const { lang, theme } = useLanguage()
  const dark = theme === 'dark'
  const [ts, setTs] = useState(() => postTimestamp(date, lang))

  // Actualizar cada 30 segundos para que el "hace X minutos" sea dinámico
  useEffect(() => {
    setTs(postTimestamp(date, lang))
    const interval = setInterval(() => setTs(postTimestamp(date, lang)), 30_000)
    return () => clearInterval(interval)
  }, [date, lang])

  return (
    <span
      title={ts.title}
      className={className}
      style={{
        fontSize:  '11px',
        color:     dark ? '#4A5568' : '#9CA3AF',
        cursor:    'default',
        userSelect:'none',
        ...style,
      }}
    >
      {ts.label}
    </span>
  )
}
