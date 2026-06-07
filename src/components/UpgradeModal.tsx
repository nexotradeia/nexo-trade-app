// ============================================================
// NEXO TRADE — Componente: UpgradeModal
// Modal de upgrade a VIP con Stripe Checkout
// ============================================================
import { useStripeCheckout } from '../hooks/useSubscription'
import { useLanguage } from '../context/LanguageContext'

// ⚠️ Reemplaza con tu Price ID real de Stripe
// Stripe Dashboard → Products → tu producto VIP → Price ID (ej: price_1ABC...)
const VIP_MONTHLY_PRICE_ID = import.meta.env.VITE_STRIPE_VIP_PRICE_ID ?? 'price_REPLACE_ME'

interface UpgradeModalProps {
  open:    boolean
  onClose: () => void
  reason?: string   // Por qué se abrió el modal (ej: 'watchlist_limit', 'gif_blocked')
}

const REASONS: Record<string, { icon: string; text: string }> = {
  watchlist_limit: { icon: '📊', text: 'Los usuarios gratis pueden guardar hasta 5 acciones.' },
  gif_blocked:     { icon: '🎬', text: 'Los GIFs en posts son exclusivos para miembros VIP.' },
  battle_blocked:  { icon: '⚔️', text: 'Crear Battle Stocks es exclusivo para miembros VIP.' },
  default:         { icon: '🚀', text: 'Accede a todas las funciones premium de NEXO TRADE.' },
}

const FEATURES = [
  { icon: '📊', text: 'Watchlist semanal ilimitada' },
  { icon: '🎬', text: 'GIFs en tus posts' },
  { icon: '⚔️', text: 'Crear Battle Stocks' },
  { icon: '⭐', text: 'Badge VIP exclusivo en tu perfil' },
  { icon: '🔔', text: 'Alertas en tiempo real de tu watchlist' },
  { icon: '🏆', text: 'Prioridad en el leaderboard' },
]

export default function UpgradeModal({ open, onClose, reason = 'default' }: UpgradeModalProps) {
  const { theme } = useLanguage()
  const dark = theme === 'dark'
  const { startCheckout, loading, error } = useStripeCheckout()
  const reasonInfo = REASONS[reason] ?? REASONS.default

  if (!open) return null

  return (
    <div
      onClick={onClose}
      style={{
        position:       'fixed', inset: 0,
        background:     'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        zIndex:         1000,
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '16px',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background:   dark ? '#131A2E' : '#ffffff',
          border:       '1px solid rgba(245,158,11,0.3)',
          borderRadius: '24px',
          padding:      '32px',
          maxWidth:     '420px',
          width:        '100%',
          boxShadow:    '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>⭐</div>
          <h2 style={{
            margin:     0,
            fontSize:   '24px',
            fontWeight: '800',
            background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            NEXO TRADE VIP
          </h2>
          <p style={{
            margin:    '8px 0 0',
            color:     dark ? '#7B8DB0' : '#6B7280',
            fontSize:  '14px',
          }}>
            {reasonInfo.icon} {reasonInfo.text}
          </p>
        </div>

        {/* Features */}
        <div style={{
          background:   dark ? 'rgba(245,158,11,0.05)' : 'rgba(245,158,11,0.08)',
          border:       '1px solid rgba(245,158,11,0.15)',
          borderRadius: '16px',
          padding:      '16px',
          marginBottom: '24px',
        }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{
              display:    'flex',
              alignItems: 'center',
              gap:        '10px',
              padding:    '6px 0',
              fontSize:   '14px',
              color:      dark ? '#C8D3F0' : '#374151',
            }}>
              <span style={{ fontSize: '16px', flexShrink: 0 }}>{f.icon}</span>
              <span>{f.text}</span>
              <span style={{ marginLeft: 'auto', color: '#10b981', fontWeight: 700 }}>✓</span>
            </div>
          ))}
        </div>

        {/* Precio */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '4px' }}>
            <span style={{ fontSize: '36px', fontWeight: '800', color: dark ? '#F0F4FF' : '#111827' }}>
              $9.99
            </span>
            <span style={{ color: dark ? '#7B8DB0' : '#9CA3AF', fontSize: '14px' }}>/mes</span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: dark ? '#7B8DB0' : '#9CA3AF' }}>
            Cancela cuando quieras · Sin compromisos
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background:   'rgba(239,68,68,0.1)',
            border:       '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px',
            padding:      '10px 14px',
            marginBottom: '16px',
            fontSize:     '13px',
            color:        '#ef4444',
          }}>
            {error}
          </div>
        )}

        {/* Botones */}
        <button
          onClick={() => startCheckout(VIP_MONTHLY_PRICE_ID)}
          disabled={loading}
          style={{
            width:        '100%',
            background:   loading ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #f59e0b, #d97706)',
            border:       'none',
            borderRadius: '14px',
            padding:      '14px',
            fontSize:     '16px',
            fontWeight:   '700',
            color:        '#fff',
            cursor:       loading ? 'not-allowed' : 'pointer',
            marginBottom: '10px',
            transition:   'all 0.2s',
            fontFamily:   'inherit',
          }}
        >
          {loading ? 'Redirigiendo a Stripe...' : '🚀 Activar VIP ahora'}
        </button>

        <button
          onClick={onClose}
          style={{
            width:        '100%',
            background:   'transparent',
            border:       `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '14px',
            padding:      '12px',
            fontSize:     '14px',
            color:        dark ? '#7B8DB0' : '#9CA3AF',
            cursor:       'pointer',
            fontFamily:   'inherit',
          }}
        >
          Quizás después
        </button>

        <p style={{
          textAlign:  'center',
          marginTop:  '12px',
          fontSize:   '11px',
          color:      dark ? '#4A5568' : '#D1D5DB',
        }}>
          🔒 Pago seguro procesado por Stripe
        </p>
      </div>
    </div>
  )
}
