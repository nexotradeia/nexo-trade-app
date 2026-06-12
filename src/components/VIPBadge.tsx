// ============================================================
// NEXO TRADE — Componente: VIPBadge
// Badge visual para usuarios VIP (en perfil, posts, etc.)
// ============================================================

interface VIPBadgeProps {
  size?: 'xs' | 'sm' | 'md'
  showLabel?: boolean
}

const sizes = {
  xs: { fontSize: '9px',  padding: '2px 6px',  gap: '3px' },
  sm: { fontSize: '10px', padding: '3px 8px',  gap: '4px' },
  md: { fontSize: '12px', padding: '4px 10px', gap: '5px' },
}

export default function VIPBadge({ size = 'sm', showLabel = true }: VIPBadgeProps) {
  const s = sizes[size]
  return (
    <span style={{
      display:        'inline-flex',
      alignItems:     'center',
      gap:            s.gap,
      background:     'linear-gradient(135deg, #f59e0b22, #f59e0b44)',
      border:         '1px solid #f59e0b66',
      borderRadius:   '100px',
      padding:        s.padding,
      fontSize:       s.fontSize,
      fontWeight:     '700',
      color:          '#f59e0b',
      letterSpacing:  '0.5px',
      lineHeight:     1,
      userSelect:     'none',
      flexShrink:     0,
    }}>
      <span>⭐</span>
      {showLabel && <span>VIP</span>}
    </span>
  )
}
