// ============================================================
// src/components/ui/StatCard.jsx
// Kartu statistik untuk dashboard (total vendor, booking, dll).
// ============================================================

/**
 * @param {string}    title    - Judul statistik
 * @param {string|number} value - Nilai utama (angka besar)
 * @param {ReactNode} icon     - Icon SVG/komponen
 * @param {string}    trend    - '+12%' atau '-3%'
 * @param {boolean}   trendUp  - true = hijau, false = merah
 * @param {string}    subtitle - Teks kecil di bawah value
 */
const StatCard = ({
  title,
  value,
  icon,
  trend,
  trendUp,
  subtitle,
  className = '',
}) => {
  return (
    <div className={[
      'bg-white border border-[var(--color-cream-border)]',
      'p-6',
      'hover:shadow-[var(--shadow-card)] transition-shadow duration-300',
      className,
    ].join(' ')}>
      {/* ── Top row: title + icon ───────────────────────── */}
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)]">
          {title}
        </p>
        {icon && (
          <div className="w-9 h-9 flex items-center justify-center text-[var(--color-gold)]">
            {icon}
          </div>
        )}
      </div>

      {/* ── Value ──────────────────────────────────────── */}
      <p className="text-3xl font-semibold font-[var(--font-display)] text-[var(--color-dark)] mb-1">
        {value ?? '—'}
      </p>

      {/* ── Subtitle & trend ───────────────────────────── */}
      <div className="flex items-center gap-2 mt-2">
        {subtitle && (
          <span className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
            {subtitle}
          </span>
        )}
        {trend && (
          <span className={[
            'text-xs font-medium font-[var(--font-sans)]',
            trendUp ? 'text-emerald-600' : 'text-red-500',
          ].join(' ')}>
            {/* ↑ atau ↓ sesuai arah trend */}
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
    </div>
  )
}

export default StatCard
