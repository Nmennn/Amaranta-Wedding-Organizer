import { useState, useEffect } from 'react'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import useAuthStore from '../../store/authStore'
import { vendorRequestService } from '../../services'
import { formatRupiah } from '../../data/packages'

const STATUS_V = { confirmed: 'success', pending: 'warning', rejected: 'danger' }
const STATUS_L = { confirmed: 'Dikonfirmasi', pending: 'Menunggu Respons', rejected: 'Ditolak' }

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
        // Response: { data: [...] } karena service helper extract data.data
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

  async function handleConfirm(req) {
    setActing(true)
    try {
      await vendorRequestService.confirm(req.id, { vendor_notes: vendorNotes })
      setRequests(p => p.map(r => r.id === req.id ? { ...r, status: 'confirmed' } : r))
      setDetail(null); setVendorNotes('')
    } catch {} finally { setActing(false) }
  }

  async function handleReject() {
    if (!rejectReason.trim()) return
    setActing(true)
    try {
      await vendorRequestService.reject(rejectModal.id, { rejection_reason: rejectReason })
      setRequests(p => p.map(r => r.id === rejectModal.id ? { ...r, status: 'rejected' } : r))
      setRejectModal(null); setRejectReason('')
    } catch {} finally { setActing(false) }
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
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Menunggu', value: pendingCount, cls: pendingCount > 0 ? 'text-amber-600' : 'text-[var(--color-dark)]', bg: pendingCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-white border-[var(--color-cream-border)]' },
          { label: 'Dikonfirmasi', value: confirmedCount, cls: 'text-emerald-600', bg: 'bg-white border-[var(--color-cream-border)]' },
          { label: 'Total Request', value: requests.length, cls: 'text-[var(--color-dark)]', bg: 'bg-white border-[var(--color-cream-border)]' },
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
          {requests.map(req => (
            <div key={req.id}
              className={['bg-white border-2 p-5 transition-all',
                req.status === 'pending' ? 'border-amber-300' : 'border-[var(--color-cream-border)]'].join(' ')}>
              <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge variant={STATUS_V[req.status]} dot>{STATUS_L[req.status]}</Badge>
                    <span className="text-xs font-mono text-[var(--color-gold)] font-[var(--font-sans)]">
                      {req.booking?.order_id}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                    Dari: {req.assigned_by?.name || 'Admin AMARANTA'}
                  </p>
                </div>
                <Button size="xs" variant="outline" onClick={() => setDetail(req)}>Lihat Detail</Button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-[var(--font-sans)] mb-3">
                <div><p className="text-[var(--color-slate)]">Pasangan</p><p className="font-medium">{req.booking?.customer?.name}</p></div>
                <div><p className="text-[var(--color-slate)]">Tgl. Nikah</p><p className="font-medium">{req.booking?.wedding_date}</p></div>
                <div><p className="text-[var(--color-slate)]">Lokasi</p><p className="font-medium truncate">{req.booking?.location}</p></div>
                <div><p className="text-[var(--color-slate)]">Nilai</p><p className="font-medium text-[var(--color-gold)]">{formatRupiah(req.booking?.total_price)}</p></div>
              </div>

              <div className="px-3 py-2 bg-[var(--color-cream)] border border-[var(--color-cream-border)] text-xs font-[var(--font-sans)] text-[var(--color-dark-muted)] mb-3">
                🎨 {req.booking?.konsep}
              </div>

              {req.status === 'pending' && (
                <div className="flex gap-3 pt-3 border-t border-[var(--color-cream-border)]">
                  <Button variant="gold" size="sm" onClick={() => setDetail(req)}>✅ Konfirmasi</Button>
                  <Button variant="danger" size="sm" onClick={() => { setRejectModal(req); setRejectReason('') }}>❌ Tolak</Button>
                </div>
              )}
              {req.status === 'rejected' && req.rejection_reason && (
                <div className="mt-2 px-3 py-2 bg-red-50 border border-red-100 text-xs text-red-600 font-[var(--font-sans)]">
                  Alasan: {req.rejection_reason}
                </div>
              )}
            </div>
          ))}
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
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: 'Pasangan',   v: detail.booking?.customer?.name },
                { l: 'Tgl. Nikah', v: detail.booking?.wedding_date },
                { l: 'Lokasi',     v: detail.booking?.location },
                { l: 'Konsep',     v: detail.booking?.konsep },
                { l: 'Paket',      v: 'Paket ' + (detail.booking?.package?.tier_id || '') },
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
            {detail.status === 'pending' && (
              <div>
                <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-1.5">Catatan Konfirmasi (opsional)</label>
                <textarea rows={2} value={vendorNotes} onChange={e => setVendorNotes(e.target.value)}
                  placeholder="Catatan untuk admin..."
                  className="w-full border-b-2 border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent text-sm font-[var(--font-sans)] outline-none py-1 resize-none transition-colors" />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal Tolak */}
      <Modal isOpen={!!rejectModal} onClose={() => setRejectModal(null)} title="Tolak Request"
        footer={<><Button variant="ghost" size="sm" onClick={() => setRejectModal(null)}>Batal</Button><Button variant="danger" size="sm" isLoading={acting} onClick={handleReject} disabled={!rejectReason.trim()}>Kirim Penolakan</Button></>}>
        {rejectModal && (
          <div className="space-y-4">
            <p className="text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)]">
              Tolak request untuk <strong>{rejectModal.booking?.customer?.name}</strong>. Admin akan memilih vendor lain.
            </p>
            <div>
              <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-1.5">Alasan <span className="text-red-400">*</span></label>
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