// ============================================================
// src/components/ui/Badge.jsx
// Label kecil untuk status, kategori, atau tag.
// ============================================================

const VARIANTS = {
  default:  'bg-[var(--color-parchment)] text-[var(--color-dark-muted)]',
  gold:     'bg-[var(--color-gold-pale)] text-[var(--color-gold)]',
  success:  'bg-emerald-50 text-emerald-700',
  warning:  'bg-amber-50 text-amber-700',
  danger:   'bg-red-50 text-red-700',
  info:     'bg-blue-50 text-blue-700',
  dark:     'bg-[var(--color-dark)] text-[var(--color-cream)]',
}

/**
 * Badge / pill label.
 * @param {string} variant - 'default' | 'gold' | 'success' | 'warning' | 'danger' | 'info' | 'dark'
 * @param {boolean} dot    - tampilkan titik warna di kiri
 */
const Badge = ({
  children,
  variant   = 'default',
  dot       = false,
  className = '',
}) => {
  // dot color mapping
  const dotColors = {
    default: 'bg-[var(--color-slate)]',
    gold:    'bg-[var(--color-gold)]',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger:  'bg-red-500',
    info:    'bg-blue-500',
    dark:    'bg-[var(--color-cream)]',
  }

  return (
    <span className={[
      'inline-flex items-center gap-1.5',
      'px-2.5 py-0.5 rounded-full',
      'text-xs font-medium font-[var(--font-sans)] tracking-wide',
      VARIANTS[variant] || VARIANTS.default,
      className,
    ].join(' ')}>
      {/* dot indicator: lingkaran kecil sebelum teks */}
      {dot && (
        <span className={[
          'w-1.5 h-1.5 rounded-full flex-shrink-0',
          dotColors[variant] || dotColors.default,
        ].join(' ')} />
      )}
      {children}
    </span>
  )
}

export default Badge
