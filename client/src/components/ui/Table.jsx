// ============================================================
// src/components/ui/Table.jsx
// Tabel data reusable dengan header, body, loading skeleton,
// empty state, dan responsive scroll.
// ============================================================

/**
 * @param {Array}   columns   - Definisi kolom: [{key, label, render?, width?}]
 * @param {Array}   data      - Array of row objects
 * @param {boolean} loading   - Tampilkan skeleton rows
 * @param {string}  emptyText - Teks saat data kosong
 * @param {string}  rowKey    - Field yang dipakai sebagai key (default: 'id')
 */
const Table = ({
  columns   = [],
  data      = [],
  loading   = false,
  emptyText = 'Tidak ada data',
  rowKey    = 'id',
  onRowClick,
  className = '',
}) => {
  // ── Skeleton row: 5 baris placeholder saat loading ───────
  const SkeletonRow = () => (
    <tr>
      {columns.map((_, i) => (
        <td key={i} className="px-5 py-4">
          {/* Animasi pulse: opacity berganti-ganti */}
          <div className="h-4 bg-[var(--color-parchment)] rounded animate-pulse" />
        </td>
      ))}
    </tr>
  )

  return (
    // overflow-x-auto: horizontal scroll di layar kecil
    <div className={['w-full overflow-x-auto', className].join(' ')}>
      <table className="w-full border-collapse">

        {/* ── THEAD ─────────────────────────────────────── */}
        <thead>
          <tr className="border-b border-[var(--color-cream-border)]">
            {columns.map((col) => (
              <th
                key={col.key}
                style={{ width: col.width }}
                className={[
                  'px-5 py-3 text-left',
                  'text-xs font-medium uppercase tracking-widest',
                  'text-[var(--color-slate)] font-[var(--font-sans)]',
                  'whitespace-nowrap',
                ].join(' ')}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* ── TBODY ─────────────────────────────────────── */}
        <tbody>
          {/* Loading state: 5 skeleton rows */}
          {loading && (
            Array.from({ length: 5 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))
          )}

          {/* Data rows */}
          {!loading && data.length > 0 && data.map((row) => (
            <tr
              key={row[rowKey]}
              onClick={() => onRowClick?.(row)}
              // onRowClick?: optional chaining - hanya dipanggil jika ada
              className={[
                'border-b border-[var(--color-cream-border)]',
                'text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)]',
                'transition-colors duration-150',
                onRowClick
                  ? 'cursor-pointer hover:bg-[var(--color-cream)]'
                  : 'hover:bg-[var(--color-cream)]/50',
              ].join(' ')}
            >
              {columns.map((col) => (
                <td key={col.key} className="px-5 py-4 whitespace-nowrap">
                  {/* render?: custom render function untuk kolom khusus */}
                  {/* Contoh: render: (row) => <Badge>{row.status}</Badge> */}
                  {col.render ? col.render(row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}

          {/* Empty state */}
          {!loading && data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                // colSpan: gabungkan semua kolom menjadi 1 sel
                className="px-5 py-16 text-center text-sm text-[var(--color-slate)] font-[var(--font-sans)]"
              >
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default Table
