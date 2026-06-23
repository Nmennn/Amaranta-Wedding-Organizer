import { useState, useEffect } from 'react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import useAuthStore from '../../store/authStore'
import { vendorRequestService } from '../../services'
import { formatRupiah } from '../../data/packages'

const STATUS_V = { confirmed: 'success', pending: 'warning', rejected: 'danger' }
const STATUS_L = { confirmed: 'Dikonfirmasi', pending: 'Menunggu Respons', rejected: 'Ditolak' }

// Helper: render bintang rating
function StarDisplay({ value }) {
  return (
    <span className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={s <= value ? 'text-[var(--color-gold)]' : 'text-[var(--color-cream-border)]'}
          style={{ fontSize: 13 }}
        >★</span>
      ))}
    </span>
  )
}

// Helper: format tanggal
function formatDate(str) {
  if (!str) return '—'
  const d = str.slice(0, 10)
  const [y, m, day] = d.split('-')
  const months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des']
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`
}

export default function VendorDashboard() {
  const user = useAuthStore(s => s.user)
  const [requests,     setRequests]     = useState([])
  const [loading,      setLoading]      = useState(true)
  const [detail,       setDetail]       = useState(null)
  const [rejectModal,  setRejectModal]  = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [vendorNotes,  setVendorNotes]  = useState('')
  const [acting,       setActing]       = useState(false)

  useEffect(() => {
    vendorRequestService.getInbox()
      .then(data => {
        const arr = Array.isArray(data) ? data : (data?.data || [])
        setRequests(arr)
      })
      .catch(err => {
        console.error('Vendor inbox error:', err)
      })
      .finally(() => setLoading(false))
  }, [])

  const pendingCount   = requests.filter(r => r.status === 'pending').length
  const confirmedCount = requests.filter(r => r.status === 'confirmed').length
  const completedCount = requests.filter(r =>
    r.booking?.admin_status === 'completed' || r.booking?.phase === 'rated'
  ).length
  const ratedCount = requests.filter(r => !!r.booking?.rating).length

  async function handleConfirm(req) {
    setActing(true)
    try {
      await vendorRequestService.confirm(req.id, { vendor_notes: vendorNotes })
      setRequests(p => p.map(r => r.id === req.id ? { ...r, status: 'confirmed' } : r))
      setDetail(null); setVendorNotes('')
    } catch (err) {
      console.error('Confirm error:', err)
    } finally { setActing(false) }
  }

  async function handleReject() {
    if (!rejectReason.trim()) return
    setActing(true)
    try {
      await vendorRequestService.reject(rejectModal.id, { rejection_reason: rejectReason })
      setRequests(p => p.map(r => r.id === rejectModal.id ? { ...r, status: 'rejected' } : r))
      setRejectModal(null); setRejectReason('')
    } catch (err) {
      console.error('Reject error:', err)
    } finally { setActing(false) }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <div className="w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-1">Panel Vendor</p>
        <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-1">
          Halo, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
          Konfirmasi atau tolak request booking dari admin AMARANTA.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Menunggu',
            value: pendingCount,
            cls: pendingCount > 0 ? 'text-amber-600' : 'text-[var(--color-dark)]',
            bg: pendingCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-[var(--color-cream-border)]'
          },
          {
            label: 'Dikonfirmasi',
            value: confirmedCount,
            cls: 'text-emerald-600',
            bg: 'bg-white border-[var(--color-cream-border)]'
          },
          {
            label: 'Selesai',
            value: completedCount,
            cls: completedCount > 0 ? 'text-blue-600' : 'text-[var(--color-dark)]',
            bg: completedCount > 0 ? 'bg-blue-50 border-blue-200' : 'bg-white border-[var(--color-cream-border)]'
          },
          {
            label: 'Dinilai Customer',
            value: ratedCount,
            cls: ratedCount > 0 ? 'text-[var(--color-gold)]' : 'text-[var(--color-dark)]',
            bg: ratedCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-[var(--color-cream-border)]'
          },
        ].map(s => (
          <div key={s.label} className={['border p-4 text-center', s.bg].join(' ')}>
            <p className={['font-[var(--font-display)] text-3xl mb-1', s.cls].join(' ')}>{s.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)]">{s.label}</p>
          </div>
        ))}
      </div>

      {pendingCount > 0 && (
        <div className="mb-6 px-5 py-4 bg-amber-50 border border-amber-200 flex items-center gap-3">
          <span className="w-8 h-8 bg-amber-200 rounded-full flex items-center justify-center text-amber-700 font-bold flex-shrink-0">{pendingCount}</span>
          <p className="text-sm font-medium text-amber-800 font-[var(--font-sans)]">
            {pendingCount} request menunggu respons Anda
          </p>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="text-center py-16">
          <p className="font-[var(--font-display)] text-2xl text-[var(--color-dark-subtle)] mb-2">Belum ada request</p>
          <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">Admin akan mengirimkan request saat ada pesanan baru.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map(req => {
            const booking = req.booking
            const isCompleted = booking?.admin_status === 'completed' || booking?.phase === 'rated'
            const hasRating = !!booking?.rating

            return (
              <div key={req.id}
                className={['bg-white border-2 p-5 transition-all',
                  req.status === 'pending' ? 'border-amber-300'
                  : isCompleted && hasRating ? 'border-emerald-200'
                  : isCompleted ? 'border-blue-200'
                  : 'border-[var(--color-cream-border)]'].join(' ')}>

                <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge variant={STATUS_V[req.status]} dot>{STATUS_L[req.status]}</Badge>
                      <span className="text-xs font-mono text-[var(--color-gold)] font-[var(--font-sans)]">
                        {booking?.order_id}
                      </span>
                      {/* Badge status acara */}
                      {(booking?.phase === 'rated' || hasRating) && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] uppercase tracking-widest font-semibold rounded">
                          ⭐ Selesai & Dinilai
                        </span>
                      )}
                      {isCompleted && !hasRating && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] uppercase tracking-widest font-semibold rounded">
                          🎉 Selesai
                        </span>
                      )}
                      {(booking?.admin_status === 'in_event' || booking?.phase === 'in_event') && !isCompleted && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] uppercase tracking-widest font-semibold rounded">
                          💒 Hari H
                        </span>
                      )}
                      {booking?.admin_status === 'preparation' && (
                        <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] uppercase tracking-widest font-semibold rounded">
                          🎪 Persiapan
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                      Dari: {req.assigned_by?.name || 'Admin AMARANTA'}
                    </p>
                  </div>
                  <Button size="xs" variant="outline" onClick={() => { setDetail(req); setVendorNotes(req.vendor_notes || '') }}>Lihat Detail</Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-[var(--font-sans)] mb-3">
                  <div><p className="text-[var(--color-slate)]">Pasangan</p><p className="font-medium">{booking?.pemesan_name || booking?.customer?.name}</p></div>
                  <div><p className="text-[var(--color-slate)]">Tgl. Nikah</p><p className="font-medium">{formatDate(booking?.wedding_date)}</p></div>
                  <div><p className="text-[var(--color-slate)]">Lokasi</p><p className="font-medium truncate">{booking?.location}</p></div>
                  <div><p className="text-[var(--color-slate)]">Nilai</p><p className="font-medium text-[var(--color-gold)]">{formatRupiah(booking?.total_price)}</p></div>
                </div>

                {booking?.konsep && (
                  <div className="px-3 py-2 bg-[var(--color-cream)] border border-[var(--color-cream-border)] text-xs font-[var(--font-sans)] text-[var(--color-dark-muted)] mb-3">
                    🎨 {booking.konsep}
                  </div>
                )}

                {/* Progress persiapan */}
                {booking?.preparation_progress > 0 && booking?.admin_status === 'preparation' && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs font-[var(--font-sans)] mb-1">
                      <span className="text-[var(--color-slate)]">Progress Persiapan</span>
                      <span className="text-[var(--color-gold)]">{booking.preparation_progress}%</span>
                    </div>
                    <div className="h-1.5 bg-[var(--color-cream-border)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--color-gold)] rounded-full transition-all"
                        style={{ width: booking.preparation_progress + '%' }} />
                    </div>
                  </div>
                )}

                {/* Rating dari customer */}
                {hasRating && (
                  <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded text-xs font-[var(--font-sans)]">
                    <p className="text-[10px] uppercase tracking-widest text-emerald-800 font-bold mb-1.5">
                      ⭐ Penilaian Customer:
                    </p>
                    <div className="flex items-center gap-2 mb-1">
                      <StarDisplay value={booking.rating} />
                      <span className="font-semibold text-emerald-900 text-sm">{booking.rating}/5</span>
                    </div>
                    {booking.review && (
                      <p className="text-emerald-700 italic">"{booking.review}"</p>
                    )}
                  </div>
                )}

                {req.status === 'pending' && (
                  <div className="flex gap-3 pt-3 border-t border-[var(--color-cream-border)]">
                    <Button variant="gold" size="sm" onClick={() => { setDetail(req); setVendorNotes('') }}>✅ Konfirmasi</Button>
                    <Button variant="danger" size="sm" onClick={() => { setRejectModal(req); setRejectReason('') }}>❌ Tolak</Button>
                  </div>
                )}
                {req.status === 'rejected' && req.rejection_reason && (
                  <div className="mt-2 px-3 py-2 bg-red-50 border border-red-100 text-xs text-red-600 font-[var(--font-sans)]">
                    Alasan: {req.rejection_reason}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Modal Detail */}
      <Modal isOpen={!!detail} onClose={() => setDetail(null)}
        title={detail ? 'Detail Request — ' + detail.booking?.order_id : ''} size="lg"
        footer={detail?.status === 'pending' ? (
          <>
            <Button variant="danger" size="sm" onClick={() => { setRejectModal(detail); setDetail(null) }}>Tolak</Button>
            <Button variant="gold" size="sm" isLoading={acting} onClick={() => handleConfirm(detail)}>Konfirmasi</Button>
          </>
        ) : undefined}>
        {detail && (
          <div className="space-y-4 font-[var(--font-sans)]">
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: 'Pasangan',   v: detail.booking?.pemesan_name || detail.booking?.customer?.name },
                { l: 'Tgl. Nikah', v: formatDate(detail.booking?.wedding_date) },
                { l: 'Lokasi',     v: detail.booking?.location },
                { l: 'Konsep',     v: detail.booking?.konsep },
                { l: 'Paket',      v: 'Paket ' + (detail.booking?.package?.tier_id?.toUpperCase() || '—') },
                { l: 'Nilai',      v: formatRupiah(detail.booking?.total_price) },
              ].map(({ l, v }) => v ? (
                <div key={l} className="border border-[var(--color-cream-border)] p-3">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)]">{l}</p>
                  <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">{v}</p>
                </div>
              ) : null)}
            </div>

            {detail.booking?.notes && (
              <div className="bg-[var(--color-cream)] p-3 border border-[var(--color-cream-border)]">
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-1">Catatan</p>
                <p className="text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)]">{detail.booking.notes}</p>
              </div>
            )}

            {detail.booking?.tech_meeting_at && (
              <div className="bg-purple-50 border border-purple-200 p-3 rounded text-purple-800">
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1">📅 Jadwal Technical Meeting:</p>
                <p className="text-xs leading-relaxed">
                  <strong>Waktu:</strong>{' '}
                  {new Date(detail.booking.tech_meeting_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                  <br /><strong>Lokasi:</strong> {detail.booking.tech_meeting_location}
                  {detail.booking.tech_meeting_notes && (<><br /><strong>Catatan:</strong> {detail.booking.tech_meeting_notes}</>)}
                </p>
              </div>
            )}

            {/* Rating customer */}
            {detail.booking?.rating && (
              <div className="bg-emerald-50 border border-emerald-200 p-3 rounded text-emerald-800">
                <p className="text-[10px] uppercase tracking-widest font-bold mb-2">⭐ Penilaian dari Customer:</p>
                <div className="flex items-center gap-2 mb-1">
                  <StarDisplay value={detail.booking.rating} />
                  <span className="text-sm font-bold text-emerald-900">{detail.booking.rating}/5</span>
                </div>
                {detail.booking.review && (
                  <p className="text-sm text-emerald-700 italic leading-relaxed">"{detail.booking.review}"</p>
                )}
                {detail.booking.rated_at && (
                  <p className="text-[10px] text-emerald-600 mt-1">
                    Diberikan pada {new Date(detail.booking.rated_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
                  </p>
                )}
              </div>
            )}

            {detail.status === 'pending' && (
              <div>
                <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-1.5">
                  Catatan Konfirmasi (opsional)
                </label>
                <textarea rows={2} value={vendorNotes} onChange={e => setVendorNotes(e.target.value)}
                  placeholder="Catatan untuk admin..."
                  className="w-full border-b-2 border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent text-sm font-[var(--font-sans)] outline-none py-1 resize-none transition-colors" />
              </div>
            )}

            {detail.vendor_notes && detail.status !== 'pending' && (
              <div className="bg-teal-50 border border-teal-200 p-3 rounded">
                <p className="text-[10px] uppercase tracking-widest text-teal-800 font-bold mb-1">💬 Catatan Koordinasi:</p>
                <p className="text-sm text-teal-900 font-medium">{detail.vendor_notes}</p>
              </div>
            )}

            {detail.status === 'rejected' && detail.rejection_reason && (
              <div className="bg-red-50 border border-red-200 p-3 rounded text-red-700">
                <p className="text-[10px] uppercase tracking-widest font-bold mb-1">Alasan Penolakan:</p>
                <p className="text-sm font-medium text-red-900">{detail.rejection_reason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Tolak */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Tolak Request"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setRejectModal(null)} disabled={acting}>Batal</Button>
            <Button variant="danger" size="sm" isLoading={acting} onClick={handleReject} disabled={!rejectReason.trim()}>Kirim Penolakan</Button>
          </>
        }>
        {rejectModal && (
          <div className="space-y-4 font-[var(--font-sans)]">
            <p className="text-sm text-[var(--color-dark-muted)]">
              Tolak request untuk <strong>{rejectModal.booking?.pemesan_name || rejectModal.booking?.customer?.name}</strong>. Admin akan memilih vendor lain.
            </p>
            <div>
              <label className="text-sm font-medium text-[var(--color-dark-muted)] block mb-1.5">Alasan <span className="text-red-400">*</span></label>
              <textarea rows={3} value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                placeholder="Tanggal sudah terisi, lokasi terlalu jauh..."
                className="w-full border-b-2 border-[var(--color-cream-border)] focus:border-red-400 bg-transparent text-sm font-[var(--font-sans)] outline-none py-2 resize-none transition-colors" />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}