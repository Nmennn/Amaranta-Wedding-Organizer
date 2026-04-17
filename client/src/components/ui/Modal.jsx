// ============================================================
// src/components/ui/Modal.jsx
// Overlay dialog untuk konfirmasi, form, atau informasi.
// Menggunakan React Portal untuk render di luar tree komponen.
//
// Portal: merender komponen ke DOM node di luar parent-nya.
// Ini penting agar modal tidak terpengaruh overflow/z-index parent.
// ============================================================

import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Button from './Button'

/**
 * Modal component.
 * @param {boolean}   isOpen    - Tampilkan/sembunyikan modal
 * @param {Function}  onClose   - Callback saat modal ditutup
 * @param {string}    title     - Judul modal
 * @param {ReactNode} children  - Konten modal
 * @param {string}    size      - 'sm' | 'md' | 'lg' | 'xl'
 * @param {boolean}   showClose - Tampilkan tombol X (default: true)
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size      = 'md',
  showClose = true,
  footer,
}) => {
  // Ref ke elemen modal untuk focus trap
  const modalRef = useRef(null)

  // ── Size classes ─────────────────────────────────────────
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-2xl',
  }

  // ── Side effects ─────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return

    // Kunci scroll body saat modal terbuka
    document.body.style.overflow = 'hidden'

    // Focus ke modal saat terbuka (accessibility)
    modalRef.current?.focus()

    // Cleanup: kembalikan scroll saat modal tutup
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Handle keyboard: ESC menutup modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose?.()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Jika tidak terbuka, jangan render apapun
  if (!isOpen) return null

  return createPortal(
    // ── Overlay ─────────────────────────────────────────────
    // inset-0 = top:0 right:0 bottom:0 left:0 → full screen
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Backdrop: area gelap di belakang modal */}
      {/* onClick backdrop → tutup modal */}
      <div
        className="absolute inset-0 bg-[var(--color-dark)]/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* ── Modal Panel ───────────────────────────────────── */}
      <div
        ref={modalRef}
        tabIndex={-1}   // tabIndex=-1: bisa di-focus via JS tapi tidak via Tab
        className={[
          'relative z-10 w-full bg-white',
          'shadow-[var(--shadow-luxury)]',
          'animate-fade-up',
          sizeClasses[size] || sizeClasses.md,
        ].join(' ')}
      >
        {/* ── Header ──────────────────────────────────────── */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--color-cream-border)]">
          {title && (
            <h2
              id="modal-title"
              className="text-lg font-semibold font-[var(--font-display)] text-[var(--color-dark)]"
            >
              {title}
            </h2>
          )}
          {showClose && (
            <button
              onClick={onClose}
              className="ml-auto p-1 text-[var(--color-slate)] hover:text-[var(--color-dark)] transition-colors"
              aria-label="Tutup modal"
            >
              {/* X icon */}
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Body ────────────────────────────────────────── */}
        <div className="p-6">
          {children}
        </div>

        {/* ── Footer (optional) ───────────────────────────── */}
        {footer && (
          <div className="px-6 pb-6 flex justify-end gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    // Target DOM node untuk portal: render ke body (bukan #root)
    document.body
  )
}

export default Modal
