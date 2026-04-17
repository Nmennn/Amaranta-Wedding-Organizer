// ============================================================
// src/components/ui/Button.jsx
// Komponen tombol reusable dengan berbagai variant & size.
// Mendukung loading state, disabled, dan polimorfisme (as prop).
// ============================================================

import { forwardRef } from 'react'

// ── Variant styles ─────────────────────────────────────────
// Object mapping: variant name → Tailwind classes
const VARIANTS = {
  // Tombol utama: background gelap
  primary: [
    'bg-[var(--color-dark)] text-[var(--color-cream)]',
    'hover:bg-[var(--color-charcoal)]',
    'border border-[var(--color-dark)]',
  ].join(' '),

  // Tombol emas: warna brand utama
  gold: [
    'bg-[var(--color-gold)] text-[var(--color-dark)]',
    'hover:bg-[var(--color-gold-light)]',
    'border border-[var(--color-gold)]',
  ].join(' '),

  // Tombol outline: hanya border
  outline: [
    'bg-transparent text-[var(--color-dark)]',
    'border border-[var(--color-dark)]',
    'hover:bg-[var(--color-dark)] hover:text-[var(--color-cream)]',
  ].join(' '),

  // Tombol outline gold
  'outline-gold': [
    'bg-transparent text-[var(--color-gold)]',
    'border border-[var(--color-gold)]',
    'hover:bg-[var(--color-gold)] hover:text-[var(--color-dark)]',
  ].join(' '),

  // Tombol ghost: tidak ada background/border sampai hover
  ghost: [
    'bg-transparent text-[var(--color-dark-muted)]',
    'hover:bg-[var(--color-parchment)] hover:text-[var(--color-dark)]',
    'border border-transparent',
  ].join(' '),

  // Tombol destruktif: aksi berbahaya (hapus dll)
  danger: [
    'bg-red-600 text-white',
    'hover:bg-red-700',
    'border border-red-600',
  ].join(' '),
}

// ── Size styles ─────────────────────────────────────────────
const SIZES = {
  xs:  'px-3 py-1.5 text-xs',
  sm:  'px-4 py-2 text-sm',
  md:  'px-6 py-3 text-sm',
  lg:  'px-8 py-4 text-base',
  xl:  'px-10 py-5 text-lg',
}

// ── Component ───────────────────────────────────────────────
// forwardRef: meneruskan ref dari parent ke elemen DOM button
// Berguna untuk fokus programatik, animasi, dll.
const Button = forwardRef(({
  children,             // konten tombol
  variant  = 'primary', // 'primary' | 'gold' | 'outline' | 'ghost' | 'danger'
  size     = 'md',      // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  isLoading = false,    // tampilkan spinner & disable tombol
  fullWidth = false,    // lebar 100%
  className = '',       // extra classes dari parent
  disabled,             // disabled standar HTML
  as: Tag = 'button',   // polimorfisme: render as 'a', 'div', dll
  ...props              // sisa props (onClick, type, href, dll)
}, ref) => {

  // ── Base classes (selalu ada) ──────────────────────────────
  const base = [
    'inline-flex items-center justify-center gap-2',
    'font-[var(--font-sans)] font-medium tracking-wide',
    'transition-all duration-200 ease-out',
    'cursor-pointer select-none',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-gold)] focus-visible:ring-offset-2',
  ].join(' ')

  // Disabled/loading: kurangi opacity & nonaktifkan pointer
  const disabledClasses = (disabled || isLoading)
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : ''

  const widthClass = fullWidth ? 'w-full' : ''

  return (
    <Tag
      ref={ref}
      disabled={Tag === 'button' ? (disabled || isLoading) : undefined}
      className={[
        base,
        VARIANTS[variant] || VARIANTS.primary,
        SIZES[size] || SIZES.md,
        disabledClasses,
        widthClass,
        className,
      ].join(' ')}
      {...props}
    >
      {/* Loading spinner: SVG animasi rotate */}
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none" viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10"
            stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </Tag>
  )
})

// displayName: penting untuk debugging di React DevTools
Button.displayName = 'Button'

export default Button
