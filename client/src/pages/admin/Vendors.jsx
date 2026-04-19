import { useState, useEffect } from 'react'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import { adminService } from '../../services'
import { formatRupiah } from '../../data/packages'

const STATUS_V = { approved: 'success', pending: 'warning', rejected: 'danger' }
const STATUS_L = { approved: 'Aktif', pending: 'Pending', rejected: 'Ditolak' }

const EMPTY_FORM = {
  name: '', email: '', password: '', category: '', location: '', description: '', since: '',
  img: '',
  // Harga paket
  price_silver: '25000000', price_gold: '45000000', price_platinum: '85000000',
}

function AdminVendors() {
  const [vendors,   setVendors]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [filter,    setFilter]    = useState('all')
  const [search,    setSearch]    = useState('')
  const [page,      setPage]      = useState(1)

  const [createModal, setCreateModal] = useState(false)
  const [editModal,   setEditModal]   = useState(null)  // vendor object
  const [detailModal, setDetailModal] = useState(null)
  const [delModal,    setDelModal]    = useState(null)
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [saving,      setSaving]      = useState(false)
  const [formErr,     setFormErr]     = useState('')

  const PER_PAGE = 8

  useEffect(() => {
    adminService.getVendors()
      .then(data => setVendors(Array.isArray(data) ? data : (data.data || [])))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = vendors
    .filter(v => filter === 'all' || v.status === filter)
    .filter(v => !search || v.name?.toLowerCase().includes(search.toLowerCase()) || v.location?.toLowerCase().includes(search.toLowerCase()))

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  function handleChange(e) {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    setFormErr('')
  }

  function openCreate() {
    setForm(EMPTY_FORM)
    setFormErr('')
    setCreateModal(true)
  }

  function openEdit(vendor) {
    setForm({
      name:          vendor.name || '',
      email:         vendor.user?.email || '',
      password:      '',
      category:      vendor.category || '',
      location:      vendor.location || '',
      description:   vendor.description || '',
      since:         vendor.since || '',
      img:           vendor.img || '',
      price_silver:  (vendor.packages?.find(p => p.tier_id === 'silver')?.price || 25000000).toString(),
      price_gold:    (vendor.packages?.find(p => p.tier_id === 'gold')?.price   || 45000000).toString(),
      price_platinum:(vendor.packages?.find(p => p.tier_id === 'platinum')?.price || 85000000).toString(),
    })
    setFormErr('')
    setEditModal(vendor)
  }

  async function handleCreate() {
    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setFormErr('Nama, email, dan password wajib diisi.')
      return
    }
    setSaving(true)
    try {
      const newVendor = await adminService.createVendor(form)
      setVendors(p => [newVendor, ...p])
      setCreateModal(false)
    } catch (err) {
      setFormErr(err.userMessage || 'Gagal membuat vendor.')
    } finally { setSaving(false) }
  }

  async function handleEdit() {
    if (!form.name.trim()) { setFormErr('Nama wajib diisi.'); return }
    setSaving(true)
    try {
      const updated = await adminService.updateVendor(editModal.id, form)
      setVendors(p => p.map(v => v.id === editModal.id ? { ...v, ...updated } : v))
      setEditModal(null)
    } catch (err) {
      setFormErr(err.userMessage || 'Gagal update vendor.')
    } finally { setSaving(false) }
  }

  async function handleApprove(id) {
    try {
      await adminService.approveVendor(id)
      setVendors(p => p.map(v => v.id === id ? { ...v, status: 'approved' } : v))
    } catch {}
  }

  async function handleReject(id) {
    try {
      await adminService.rejectVendor(id)
      setVendors(p => p.map(v => v.id === id ? { ...v, status: 'rejected' } : v))
    } catch {}
  }

  async function handleDelete() {
    try {
      await adminService.deleteVendor(delModal.id)
      setVendors(p => p.filter(v => v.id !== delModal.id))
      setDelModal(null)
    } catch {}
  }

  const FormFields = () => (
    <div className="space-y-4">
      {formErr && <div className="px-3 py-2 bg-red-50 border border-red-200 text-sm text-red-600 font-[var(--font-sans)]">⚠️ {formErr}</div>}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Nama Vendor" name="name" value={form.name} onChange={handleChange} required />
        <Input label="Email Login" type="email" name="email" value={form.email} onChange={handleChange} required />
      </div>
      {createModal && (
        <Input label="Password" type="password" name="password" value={form.password} onChange={handleChange}
          required hint="Min. 8 karakter" />
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input label="Kategori" name="category" value={form.category} onChange={handleChange}
          placeholder="Fotografer, Katering, Dekorasi..." />
        <Input label="Lokasi" name="location" value={form.location} onChange={handleChange}
          placeholder="Jakarta, Bandung..." />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Tahun Berdiri" type="number" name="since" value={form.since} onChange={handleChange}
          placeholder="2018" />
        <Input label="URL Foto Cover" name="img" value={form.img} onChange={handleChange}
          placeholder="https://..." />
      </div>
      <div>
        <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-1.5">Deskripsi</label>
        <textarea rows={3} name="description" value={form.description} onChange={handleChange}
          placeholder="Tentang vendor..."
          className="w-full border-b-2 border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent text-sm font-[var(--font-sans)] outline-none py-1 resize-none transition-colors" />
      </div>
      <div className="pt-2 border-t border-[var(--color-cream-border)]">
        <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-3">Harga Paket (Rp)</p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { key: 'price_silver',   label: 'Silver',   color: '#A8B8C8' },
            { key: 'price_gold',     label: 'Gold',     color: '#C9A96E' },
            { key: 'price_platinum', label: 'Platinum', color: '#B8A9C9' },
          ].map(({ key, label, color }) => (
            <div key={key}>
              <label className="text-xs font-[var(--font-sans)] mb-1 block" style={{ color }}>{label}</label>
              <input type="number" name={key} value={form[key]} onChange={handleChange}
                className="w-full border-b border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent text-sm font-[var(--font-sans)] outline-none py-1 transition-colors" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)]">Kelola Vendor</h1>
          <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">Buat, edit, dan kelola vendor AMARANTA</p>
        </div>
        <Button variant="gold" onClick={openCreate}>+ Tambah Vendor</Button>
      </div>

      {/* Filter + Search */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          placeholder="Cari nama atau kota..."
          className="flex-1 min-w-[180px] px-3 py-2 border border-[var(--color-cream-border)] bg-white text-sm font-[var(--font-sans)] outline-none focus:border-[var(--color-gold)] transition-colors" />
        {['all','approved','pending','rejected'].map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1) }}
            className={['px-3 py-2 text-xs uppercase tracking-widest font-[var(--font-sans)] border transition-all',
              filter === f ? 'bg-[var(--color-dark)] text-[var(--color-cream)] border-[var(--color-dark)]'
              : 'bg-white border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-dark)]'].join(' ')}>
            {f === 'all' ? 'Semua' : STATUS_L[f]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="inline-block w-8 h-8 border-2 border-[var(--color-gold)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {paginated.map(v => (
              <div key={v.id}
                className="bg-white border border-[var(--color-cream-border)] hover:shadow-[var(--shadow-card)] transition-all">
                {/* Cover */}
                <div className="aspect-video overflow-hidden bg-[var(--color-parchment)] relative">
                  {v.img ? (
                    <img src={v.img} alt={v.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--color-slate)]">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <span className={['text-[9px] px-1.5 py-0.5 font-[var(--font-sans)] rounded',
                      v.status === 'approved' ? 'bg-green-500 text-white'
                      : v.status === 'pending' ? 'bg-amber-400 text-white'
                      : 'bg-red-500 text-white'].join(' ')}>
                      {STATUS_L[v.status]}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <p className="font-[var(--font-display)] text-base text-[var(--color-dark)] mb-0.5 truncate">{v.name}</p>
                  <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mb-3 truncate">
                    {v.category || '—'} · {v.location || '—'}
                  </p>

                  {/* Paket harga mini */}
                  {v.packages?.length > 0 && (
                    <div className="flex gap-1 mb-3">
                      {v.packages.map(p => (
                        <span key={p.tier_id} className="text-[9px] px-1.5 py-0.5 bg-[var(--color-cream)] font-[var(--font-sans)] text-[var(--color-dark-muted)]">
                          {p.tier_id.charAt(0).toUpperCase() + p.tier_id.slice(1)}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => setDetailModal(v)}
                      className="text-xs px-2.5 py-1.5 border border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-dark)] font-[var(--font-sans)] transition-colors">
                      Detail
                    </button>
                    <button onClick={() => openEdit(v)}
                      className="text-xs px-2.5 py-1.5 border border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-gold)] font-[var(--font-sans)] transition-colors">
                      Edit
                    </button>
                    {v.status === 'pending' && (
                      <button onClick={() => handleApprove(v.id)}
                        className="text-xs px-2.5 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-[var(--font-sans)] transition-colors">
                        Setujui
                      </button>
                    )}
                    <button onClick={() => setDelModal(v)}
                      className="text-xs px-2.5 py-1.5 border border-red-200 text-red-500 hover:bg-red-50 font-[var(--font-sans)] transition-colors">
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">Tidak ada vendor ditemukan.</p>
            </div>
          )}

          {/* Paginasi simpel */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={['w-8 h-8 text-xs font-[var(--font-sans)] border transition-all',
                    page === p ? 'bg-[var(--color-dark)] text-[var(--color-cream)] border-[var(--color-dark)]'
                    : 'border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-dark)]'].join(' ')}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Modal Create */}
      <Modal isOpen={createModal} onClose={() => setCreateModal(false)} title="Tambah Vendor Baru" size="lg"
        footer={<><Button variant="ghost" size="sm" onClick={() => setCreateModal(false)}>Batal</Button><Button variant="gold" size="sm" onClick={handleCreate} isLoading={saving}>Simpan</Button></>}>
        <FormFields />
      </Modal>

      {/* Modal Edit */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title={'Edit Vendor — ' + (editModal?.name || '')} size="lg"
        footer={<><Button variant="ghost" size="sm" onClick={() => setEditModal(null)}>Batal</Button><Button variant="gold" size="sm" onClick={handleEdit} isLoading={saving}>Simpan Perubahan</Button></>}>
        <FormFields />
      </Modal>

      {/* Modal Detail */}
      <Modal isOpen={!!detailModal} onClose={() => setDetailModal(null)} title={detailModal?.name || ''} size="lg">
        {detailModal && (
          <div className="space-y-4">
            {detailModal.img && (
              <img src={detailModal.img} alt={detailModal.name} className="w-full h-48 object-cover" />
            )}
            <div className="grid grid-cols-2 gap-3 text-sm font-[var(--font-sans)]">
              {[
                { l: 'Kategori',   v: detailModal.category },
                { l: 'Lokasi',     v: detailModal.location },
                { l: 'Sejak',      v: detailModal.since },
                { l: 'Rating',     v: detailModal.rating + ' ★' },
                { l: 'Ulasan',     v: detailModal.review_count + ' ulasan' },
                { l: 'Email',      v: detailModal.user?.email },
              ].filter(x => x.v).map(({ l, v }) => (
                <div key={l} className="border border-[var(--color-cream-border)] p-2.5">
                  <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] mb-0.5">{l}</p>
                  <p className="font-medium text-[var(--color-dark)]">{v}</p>
                </div>
              ))}
            </div>
            {detailModal.description && (
              <p className="text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)] leading-relaxed">
                {detailModal.description}
              </p>
            )}
            {detailModal.packages?.length > 0 && (
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-2">Paket</p>
                <div className="flex gap-3">
                  {detailModal.packages.map(p => (
                    <div key={p.tier_id} className="border border-[var(--color-cream-border)] p-3 text-center">
                      <p className="text-xs font-medium text-[var(--color-dark)] capitalize font-[var(--font-sans)]">{p.tier_id}</p>
                      <p className="font-[var(--font-display)] text-sm text-[var(--color-gold)]">{formatRupiah(p.price)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex gap-2 pt-2">
              {detailModal.status === 'pending' && (
                <Button variant="gold" size="sm" onClick={() => { handleApprove(detailModal.id); setDetailModal(null) }}>Setujui Vendor</Button>
              )}
              {detailModal.status === 'approved' && (
                <Button variant="danger" size="sm" onClick={() => { handleReject(detailModal.id); setDetailModal(null) }}>Nonaktifkan</Button>
              )}
              <Button variant="outline" size="sm" onClick={() => { setDetailModal(null); openEdit(detailModal) }}>Edit Vendor</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Hapus */}
      <Modal isOpen={!!delModal} onClose={() => setDelModal(null)} title="Hapus Vendor"
        footer={<><Button variant="ghost" size="sm" onClick={() => setDelModal(null)}>Batal</Button><Button variant="danger" size="sm" onClick={handleDelete}>Ya, Hapus</Button></>}>
        {delModal && (
          <p className="text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)]">
            Yakin menghapus vendor <strong>{delModal.name}</strong>? Semua data terkait akan ikut terhapus.
          </p>
        )}
      </Modal>
    </div>
  )
}

export default AdminVendors