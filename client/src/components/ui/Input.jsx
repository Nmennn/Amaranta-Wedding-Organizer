// ============================================================
// src/components/ui/Input.jsx
// Form input component dengan label, error state, dan icon.
// forwardRef agar bisa digunakan dengan react-hook-form / ref.
// ============================================================

import { forwardRef } from 'react'

/**
 * Input component.
 * @param {string}    label       - Label teks di atas input
 * @param {string}    error       - Pesan error (ditampilkan merah di bawah)
 * @param {ReactNode} leftIcon    - Icon di sisi kiri input
 * @param {ReactNode} rightIcon   - Icon di sisi kanan input
 * @param {string}    hint        - Teks bantuan di bawah input (abu-abu)
 * @param {boolean}   fullWidth   - Lebar 100%
 */
const Input = forwardRef(({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  fullWidth   = true,
  className   = '',
  id,
  ...props      // sisa props: type, value, onChange, placeholder, dll
}, ref) => {
  // Generate id unik dari label jika tidak disediakan
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={['flex flex-col gap-1.5', fullWidth ? 'w-full' : '', className].join(' ')}>

      {/* ── Label ─────────────────────────────────────────── */}
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)]"
        >
          {label}
          {/* Asterisk merah jika required */}
          {props.required && (
            <span className="text-red-500 ml-1" aria-hidden="true">*</span>
          )}
        </label>
      )}

      {/* ── Input Wrapper (untuk positioning icon) ───────── */}
      <div className="relative">
        {/* Left icon */}
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-slate)] pointer-events-none">
            {leftIcon}
          </div>
        )}

        {/* ── Input element ─────────────────────────────── */}
        <input
          ref={ref}
          id={inputId}
          className={[
            'w-full rounded-none',
            'bg-white border-b-2',
            error
              ? 'border-red-400 focus:border-red-500'
              : 'border-[var(--color-cream-border)] focus:border-[var(--color-gold)]',
            'px-0 py-3',
            'text-sm text-[var(--color-dark)] font-[var(--font-sans)]',
            'placeholder:text-[var(--color-slate)]',
            'outline-none transition-colors duration-200',
            'bg-transparent',
            leftIcon  ? 'pl-9' : '',
            rightIcon ? 'pr-9' : '',
          ].join(' ')}
          {...props}
        />

        {/* Right icon */}
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-slate)]">
            {rightIcon}
          </div>
        )}
      </div>

      {/* ── Error message ─────────────────────────────────── */}
      {error && (
        <p className="text-xs text-red-500 font-[var(--font-sans)]" role="alert">
          {/* role="alert": screen reader langsung baca ini saat muncul */}
          {error}
        </p>
      )}

      {/* ── Hint text ─────────────────────────────────────── */}
      {hint && !error && (
        <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
          {hint}
        </p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
