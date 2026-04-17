// ============================================================
// src/components/ui/Pagination.jsx
// Navigasi halaman untuk list data.
// ============================================================

/**
 * @param {number}   currentPage  - Halaman aktif (1-based)
 * @param {number}   totalPages   - Total halaman
 * @param {Function} onPageChange - Callback: (page: number) => void
 * @param {number}   siblings     - Jumlah tombol halaman di kiri/kanan aktif
 */
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  siblings = 1,
}) => {
  if (totalPages <= 1) return null  // tidak perlu pagination jika hanya 1 hal

  // ── Hitung range halaman yang ditampilkan ─────────────────
  // Contoh: currentPage=5, siblings=1, totalPages=10
  // → tampilkan: [1, ..., 4, 5, 6, ..., 10]
  const range = (start, end) =>
    Array.from({ length: end - start + 1 }, (_, i) => start + i)

  const totalPageNumbers = siblings * 2 + 5  // kiri + kanan + aktif + 2 dots + 2 ujung

  let pages
  if (totalPages <= totalPageNumbers) {
    // Tampilkan semua halaman
    pages = range(1, totalPages)
  } else {
    const leftSibling  = Math.max(currentPage - siblings, 1)
    const rightSibling = Math.min(currentPage + siblings, totalPages)
    const showLeftDots  = leftSibling  > 2
    const showRightDots = rightSibling < totalPages - 1

    if (!showLeftDots && showRightDots) {
      // Aktif dekat halaman pertama
      pages = [...range(1, 3 + siblings * 2), '...', totalPages]
    } else if (showLeftDots && !showRightDots) {
      // Aktif dekat halaman terakhir
      pages = [1, '...', ...range(totalPages - 2 - siblings * 2, totalPages)]
    } else {
      // Di tengah
      pages = [1, '...', ...range(leftSibling, rightSibling), '...', totalPages]
    }
  }

  // ── Button styles ─────────────────────────────────────────
  const btnBase = [
    'w-9 h-9 flex items-center justify-center',
    'text-sm font-[var(--font-sans)]',
    'transition-all duration-150',
    'border',
  ].join(' ')

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1">

      {/* ← Prev button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={[
          btnBase,
          'px-3',
          currentPage === 1
            ? 'border-[var(--color-cream-border)] text-[var(--color-slate)] opacity-40 cursor-not-allowed'
            : 'border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]',
        ].join(' ')}
        aria-label="Halaman sebelumnya"
      >
        ←
      </button>

      {/* Page numbers */}
      {pages.map((page, i) =>
        page === '...'
          ? (
            // Ellipsis: titik tiga pengganti halaman yang disembunyikan
            <span key={`dots-${i}`} className="w-9 h-9 flex items-center justify-center text-[var(--color-slate)]">
              …
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              aria-current={page === currentPage ? 'page' : undefined}
              className={[
                btnBase,
                page === currentPage
                  ? 'bg-[var(--color-dark)] border-[var(--color-dark)] text-[var(--color-cream)]'
                  : 'border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]',
              ].join(' ')}
            >
              {page}
            </button>
          )
      )}

      {/* → Next button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={[
          btnBase,
          'px-3',
          currentPage === totalPages
            ? 'border-[var(--color-cream-border)] text-[var(--color-slate)] opacity-40 cursor-not-allowed'
            : 'border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]',
        ].join(' ')}
        aria-label="Halaman berikutnya"
      >
        →
      </button>
    </nav>
  )
}

export default Pagination
