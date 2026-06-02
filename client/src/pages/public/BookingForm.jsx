import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import useAuthStore from '../../store/authStore'
import { bookingService } from '../../services'
import { toastSuccess, toastError } from '../../hooks/useToast'
import { PACKAGES, formatRupiah } from '../../data/packages'

export default function BookingForm() {
  const { tierId } = useParams()
  const navigate = useNavigate()
  const user = useAuthStore(s => s.user)
  const token = useAuthStore(s => s.token)

  // Jika tidak login, redirect ke login
  useEffect(() => {
    if (!token) {
      navigate('/masuk')
    }
  }, [token, navigate])

  // State form
  const [loading, setLoading] = useState(false)
  const [weddingDate, setWeddingDate] = useState('')
  const [location, setLocation] = useState('')
  const [concept, setConcept] = useState('')
  const [guestCount, setGuestCount] = useState('')
  const [notes, setNotes] = useState('')
  const [accepted, setAccepted] = useState(false)

  // Cari paket berdasarkan tierId
  const pkg = PACKAGES.find(p => p.tier_id === tierId?.toLowerCase())

  if (!pkg) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-[var(--color-cream)] flex flex-col items-center justify-center px-4">
          <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] mb-4">
            Paket tidak ditemukan
          </p>
          <Link to="/paket"
            className="px-6 py-2 bg-[var(--color-gold)] text-[var(--color-dark)] text-xs uppercase tracking-widest font-[var(--font-sans)] hover:bg-[var(--color-gold-light)] transition-colors">
            Kembali ke Paket
          </Link>
        </div>
      </>
    )
  }

  async function handleSubmit(e) {
    e.preventDefault()

    if (!weddingDate || !location || !concept) {
      toastError('Tanggal nikah, lokasi, dan konsep wajib diisi')
      return
    }

    if (!accepted) {
      toastError('Setujui syarat & ketentuan untuk melanjutkan')
      return
    }

    setLoading(true)
    try {
      const bookingData = {
        tier_id: pkg.tier_id,
        wedding_date: weddingDate,
        location,
        konsep: concept,
        guest_count: guestCount ? Number(guestCount) : null,
        notes,
      }

      const result = await bookingService.create(bookingData)
      const bookingId = result.id

      toastSuccess('Booking berhasil dibuat! Lanjut ke pembayaran...')

      // Redirect ke halaman pembayaran
      setTimeout(() => {
        navigate(`/pelanggan/invoice/${bookingId}`)
      }, 1000)
    } catch (err) {
      toastError(err.userMessage || 'Gagal membuat booking')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--color-cream)] py-12 px-4">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-2">
              Formulir Pemesanan
            </p>
            <h1 className="font-[var(--font-display)] text-4xl text-[var(--color-dark)] mb-2">
              Paket {pkg.name}
            </h1>
            <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
              Isi detail pernikahan Anda untuk melanjutkan pemesanan
            </p>
          </div>

          {/* Card paket dipilih */}
          <div className="mb-8 bg-white border border-[var(--color-cream-border)] p-6">
            <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
              <div>
                <h2 className="font-[var(--font-display)] text-2xl text-[var(--color-dark)] mb-2">
                  {pkg.name}
                </h2>
                <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] mb-3">
                  {pkg.description}
                </p>
                <ul className="space-y-1 text-xs text-[var(--color-dark-muted)] font-[var(--font-sans)]">
                  {pkg.features?.slice(0, 3).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-[var(--color-gold)] flex-shrink-0">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mb-1">
                  Harga Paket
                </p>
                <p className="font-[var(--font-display)] text-2xl text-[var(--color-gold)]">
                  {formatRupiah(pkg.price)}
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-white border border-[var(--color-cream-border)] p-6 space-y-5">
            {/* Tanggal Nikah */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-dark)] font-[var(--font-sans)] mb-2">
                Tanggal Nikah <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={weddingDate}
                onChange={e => setWeddingDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-[var(--color-cream-border)] bg-white text-sm font-[var(--font-sans)] outline-none focus:border-[var(--color-gold)] transition-colors"
              />
              <p className="text-[10px] text-[var(--color-slate)] font-[var(--font-sans)] mt-1">
                Pilih tanggal pernikahan Anda
              </p>
            </div>

            {/* Lokasi */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-dark)] font-[var(--font-sans)] mb-2">
                Lokasi Acara <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="Nama lokasi, alamat, atau nama taman"
                required
                className="w-full px-3 py-2 border border-[var(--color-cream-border)] bg-white text-sm font-[var(--font-sans)] outline-none focus:border-[var(--color-gold)] transition-colors"
              />
              <p className="text-[10px] text-[var(--color-slate)] font-[var(--font-sans)] mt-1">
                Contoh: Ballroom Grand Hotel, Taman Impian Bogor
              </p>
            </div>

            {/* Konsep */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-dark)] font-[var(--font-sans)] mb-2">
                Konsep / Tema <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={concept}
                onChange={e => setConcept(e.target.value)}
                placeholder="Konsep pernikahan yang Anda inginkan"
                required
                className="w-full px-3 py-2 border border-[var(--color-cream-border)] bg-white text-sm font-[var(--font-sans)] outline-none focus:border-[var(--color-gold)] transition-colors"
              />
              <p className="text-[10px] text-[var(--color-slate)] font-[var(--font-sans)] mt-1">
                Contoh: Rustic Garden, Modern Minimalis, Klasik Elegan
              </p>
            </div>

            {/* Jumlah Tamu (Opsional) */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-dark)] font-[var(--font-sans)] mb-2">
                Perkiraan Jumlah Tamu (Opsional)
              </label>
              <input
                type="number"
                value={guestCount}
                onChange={e => setGuestCount(e.target.value)}
                placeholder="Contoh: 200"
                min="0"
                className="w-full px-3 py-2 border border-[var(--color-cream-border)] bg-white text-sm font-[var(--font-sans)] outline-none focus:border-[var(--color-gold)] transition-colors"
              />
              <p className="text-[10px] text-[var(--color-slate)] font-[var(--font-sans)] mt-1">
                Membantu kami mempersiapkan detail yang lebih baik
              </p>
            </div>

            {/* Catatan (Opsional) */}
            <div>
              <label className="block text-xs font-medium text-[var(--color-dark)] font-[var(--font-sans)] mb-2">
                Catatan / Permintaan Khusus (Opsional)
              </label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Contoh: Ingin dekorasi warna merah dan putih, ada vegetarian guests, dll"
                rows="4"
                className="w-full px-3 py-2 border border-[var(--color-cream-border)] bg-white text-sm font-[var(--font-sans)] outline-none focus:border-[var(--color-gold)] transition-colors resize-none"
              />
            </div>

            {/* Persetujuan */}
            <div className="pt-2 border-t border-[var(--color-cream-border)]">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={e => setAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 border border-[var(--color-cream-border)] rounded accent-[var(--color-gold)] cursor-pointer flex-shrink-0"
                />
                <span className="text-xs text-[var(--color-dark-muted)] font-[var(--font-sans)] group-hover:text-[var(--color-dark)]">
                  Saya setuju dengan{' '}
                  <Link to="#" className="text-[var(--color-gold)] hover:underline">
                    syarat & ketentuan
                  </Link>
                  {' '}dan{' '}
                  <Link to="#" className="text-[var(--color-gold)] hover:underline">
                    kebijakan privasi
                  </Link>
                  {' '}AMARANTA Wedding Organizer
                </span>
              </label>
            </div>

            {/* Tombol */}
            <div className="flex gap-3 pt-2">
              <Link to="/paket"
                className="flex-1 text-center py-3 border border-[var(--color-cream-border)] text-xs uppercase tracking-widest text-[var(--color-dark-muted)] font-[var(--font-sans)] hover:border-[var(--color-dark)] transition-colors">
                ← Kembali
              </Link>
              <button
                type="submit"
                disabled={loading || !accepted}
                className="flex-1 py-3 bg-[var(--color-gold)] text-[var(--color-dark)] text-xs uppercase tracking-widest font-[var(--font-sans)] hover:bg-[var(--color-gold-light)] disabled:bg-[var(--color-cream-border)] disabled:text-[var(--color-slate)] disabled:cursor-not-allowed transition-colors">
                {loading ? 'Memproses...' : 'Lanjut ke Pembayaran →'}
              </button>
            </div>
          </form>

          {/* Info kontak */}
          <div className="mt-8 p-5 bg-white border border-[var(--color-cream-border)]">
            <p className="text-xs font-medium text-[var(--color-dark)] font-[var(--font-sans)] mb-2">
              💬 Ada pertanyaan?
            </p>
            <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
              Hubungi tim AMARANTA di{' '}
              <a href="tel:081234567890" className="text-[var(--color-gold)] hover:underline">
                081234567890
              </a>
              {' '}atau{' '}
              <a href="mailto:info@amaranta.com" className="text-[var(--color-gold)] hover:underline">
                info@amaranta.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>

  )
}
//       {/* Alert butuh aksi */}
//       {needAction > 0 && (
//         <div className="mb-5 flex items-center justify-between px-5 py-4 bg-amber-50 border border-amber-200">
//           <div className="flex items-center gap-3">
//             <span className="w-7 h-7 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 font-bold text-sm flex-shrink-0">
//               {needAction}
//             </span>
//             <p className="text-sm font-medium text-amber-800 font-[var(--font-sans)]">
//               {needAction} booking perlu tindakan Anda
//             </p>
//           </div>
//           <button onClick={() => { setFilter('waiting_vendor'); setPage(1) }}
//             className="text-xs text-amber-700 hover:underline font-[var(--font-sans)]">
//             Lihat →
//           </button>
//         </div>
//       )}

//       {/* Filter + Search */}
//       <div className="flex flex-wrap gap-3 mb-6">
//         <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
//           placeholder="Cari order ID, nama, lokasi..."
//           className="flex-1 min-w-[200px] px-3 py-2 border border-[var(--color-cream-border)] bg-white text-sm font-[var(--font-sans)] outline-none focus:border-[var(--color-gold)] transition-colors" />
//         {[
//           { val: 'all', label: 'Semua' },
//           { val: 'waiting_vendor', label: 'Pilih Vendor' },
//           { val: 'vendor_assigned', label: 'Menunggu Vendor' },
//           { val: 'vendor_confirmed', label: 'Vendor Konfirm' },
//           { val: 'preparation', label: 'Persiapan' },
//           { val: 'in_event', label: 'Hari H' },
//         ].map(f => (
//           <button key={f.val} onClick={() => { setFilter(f.val); setPage(1) }}
//             className={['px-3 py-2 text-xs uppercase tracking-widest font-[var(--font-sans)] border transition-all',
//               filter === f.val
//                 ? 'bg-[var(--color-dark)] text-[var(--color-cream)] border-[var(--color-dark)]'
//                 : 'bg-white border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-dark)]'].join(' ')}>
//             {f.label}
//           </button>
//         ))}
//       </div>

//       {/* Tabel */}
//       {loading ? (
//         <div className="text-center py-20">
//           <div className="inline-block w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
//         </div>
//       ) : (
//         <>
//           <div className="bg-white border border-[var(--color-cream-border)] overflow-hidden mb-4">
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm font-[var(--font-sans)]">
//                 <thead>
//                   <tr className="bg-[var(--color-cream)] border-b border-[var(--color-cream-border)]">
//                     {['Order', 'Pemesan', 'Paket', 'Tgl Acara', 'Lokasi', 'Vendor', 'Status', 'Progress', ''].map(h => (
//                       <th key={h} className="text-left px-4 py-3 text-[10px] uppercase tracking-widest text-[var(--color-slate)] whitespace-nowrap">{h}</th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginated.map(b => (
//                     <tr key={b.id}
//                       className="border-b border-[var(--color-cream-border)] last:border-0 hover:bg-[var(--color-cream)] transition-colors">
//                       <td className="px-4 py-3">
//                         <p className="text-xs font-mono text-[var(--color-gold)]">{b.order_id}</p>
//                       </td>
//                       <td className="px-4 py-3">
//                         <p className="font-medium text-[var(--color-dark)]">{b.pemesan_name}</p>
//                         <p className="text-xs text-[var(--color-slate)]">{b.pemesan_phone}</p>
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className={['text-xs px-2 py-0.5 rounded capitalize',
//                           { silver: 'bg-gray-100 text-gray-600', gold: 'bg-amber-50 text-amber-700', platinum: 'bg-purple-50 text-purple-700' }[b.package?.tier_id] || 'bg-gray-100 text-gray-600'
//                         ].join(' ')}>
//                           {b.package?.tier_id || '—'}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3 text-[var(--color-dark-muted)] whitespace-nowrap">
//                         {b.wedding_date || '—'}
//                       </td>
//                       <td className="px-4 py-3 text-[var(--color-slate)] max-w-[120px] truncate">
//                         {b.location || '—'}
//                       </td>
//                       <td className="px-4 py-3 text-xs text-[var(--color-dark-muted)]">
//                         {b.vendor?.name || <span className="text-[var(--color-slate)] italic">Belum</span>}
//                       </td>
//                       <td className="px-4 py-3">
//                         <span className={['text-[10px] px-2 py-0.5 rounded font-[var(--font-sans)]',
//                           STATUS_STYLE[b.admin_status] || 'bg-gray-100 text-gray-500'].join(' ')}>
//                           {STATUS_LABEL[b.admin_status] || b.admin_status}
//                         </span>
//                       </td>
//                       <td className="px-4 py-3">
//                         {b.preparation_progress > 0 && (
//                           <div className="flex items-center gap-2">
//                             <div className="w-16 h-1.5 bg-[var(--color-cream-border)] rounded-full overflow-hidden">
//                               <div className="h-full bg-[var(--color-gold)] rounded-full"
//                                 style={{ width: b.preparation_progress + '%' }} />
//                             </div>
//                             <span className="text-[10px] text-[var(--color-slate)] font-[var(--font-sans)]">
//                               {b.preparation_progress}%
//                             </span>
//                           </div>
//                         )}
//                       </td>
//                       <td className="px-4 py-3">
//                         <button onClick={() => setDetail(b)}
//                           className="text-xs px-3 py-1.5 border border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] font-[var(--font-sans)] transition-all whitespace-nowrap">
//                           Kelola
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {filtered.length === 0 && (
//             <p className="text-center py-12 text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
//               Tidak ada booking ditemukan.
//             </p>
//           )}

//           {/* Paginasi */}
//           {totalPages > 1 && (
//             <div className="flex justify-center gap-2">
//               {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
//                 <button key={p} onClick={() => setPage(p)}
//                   className={['w-8 h-8 text-xs font-[var(--font-sans)] border transition-all',
//                     page === p
//                       ? 'bg-[var(--color-dark)] text-[var(--color-cream)] border-[var(--color-dark)]'
//                       : 'border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-dark)]'].join(' ')}>
//                   {p}
//                 </button>
//               ))}
//             </div>
//           )}
//         </>
//       )}

//       {/* Modal detail + workflow */}
//       <Modal isOpen={!!detail} onClose={() => setDetail(null)}
//         title={detail ? detail.order_id + ' — ' + detail.pemesan_name : ''}
//         size="xl">
//         {detail && (
//           <div>
//             {/* Info booking */}
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-2">
//               {[
//                 { l: 'Paket', v: detail.package?.tier_id },
//                 { l: 'Tgl Nikah', v: detail.wedding_date },
//                 { l: 'Lokasi', v: detail.location },
//                 { l: 'Konsep', v: detail.konsep },
//                 { l: 'Total', v: formatRupiah(detail.total_price) },
//                 { l: 'HP', v: detail.pemesan_phone },
//               ].filter(x => x.v).map(({ l, v }) => (
//                 <div key={l} className="border border-[var(--color-cream-border)] p-3">
//                   <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)]">{l}</p>
//                   <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)] capitalize">{v}</p>
//                 </div>
//               ))}
//             </div>
//             {detail.notes && (
//               <div className="mb-2 px-3 py-2 bg-[var(--color-cream)] border border-[var(--color-cream-border)]">
//                 <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-1">Catatan</p>
//                 <p className="text-xs text-[var(--color-dark-muted)] font-[var(--font-sans)]">{detail.notes}</p>
//               </div>
//             )}

//             <WorkflowPanel
//               booking={detail}
//               vendors={vendors}
//               onUpdated={async () => {
//                 await load()
//                 // Refresh detail dengan data terbaru
//                 const fresh = await adminService.getBookings()
//                 const arr = Array.isArray(fresh) ? fresh : (fresh.data || [])
//                 const updated = arr.find(b => b.id === detail.id)
//                 if (updated) setDetail(updated)
//               }}
//             />
//           </div>
//         )}
//       </Modal>
//     </div>
//   )
// }