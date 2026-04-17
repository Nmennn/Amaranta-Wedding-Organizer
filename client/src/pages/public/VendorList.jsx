// ============================================================
// src/pages/public/VendorList.jsx — Daftar Semua Vendor
// Berbeda dari halaman Paket: ini menampilkan vendor per entitas
// ============================================================
import { useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { VENDORS, formatRupiah } from '../../data/packages'
import Badge from '../../components/ui/Badge'

const KATEGORI = ['Semua', 'Venue & Full Service', 'Dekorasi & Florist', 'Fotografer & Videografer', 'Venue Outdoor', 'Musik & Hiburan', 'Katering']

const VendorList = () => {
  const [cat,    setCat]    = useState('Semua')
  const [search, setSearch] = useState('')
  const [sort,   setSort]   = useState('rating')

  const filtered = VENDORS
    .filter((v) => cat === 'Semua' || v.category === cat)
    .filter((v) => !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.location.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === 'rating' ? b.rating - a.rating : Math.min(...a.packages.map(p => p.price)) - Math.min(...b.packages.map(p => p.price)))

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />

      {/* Hero */}
      <section className="bg-[var(--color-dark)] py-14 px-6 lg:px-12">
        <div className="max-w-5xl mx-auto">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-3">Mitra Kami</p>
          <h1 className="font-[var(--font-display)] text-4xl text-[var(--color-cream)] mb-5">Direktori Vendor</h1>
          <div className="relative max-w-lg">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari vendor atau lokasi..."
              className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 text-[var(--color-cream)] placeholder:text-white/40 text-sm font-[var(--font-sans)] outline-none focus:border-[var(--color-gold)] transition-colors" />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        {/* Filter */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {KATEGORI.map((k) => (
              <button key={k} onClick={() => setCat(k)}
                className={['px-4 py-1.5 text-xs uppercase tracking-widest font-[var(--font-sans)] border transition-all', cat === k ? 'bg-[var(--color-dark)] text-[var(--color-cream)] border-[var(--color-dark)]' : 'border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-dark)]'].join(' ')}>
                {k}
              </button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)}
            className="text-xs font-[var(--font-sans)] border border-[var(--color-cream-border)] bg-white px-3 py-2 text-[var(--color-dark-muted)] outline-none">
            <option value="rating">Rating Tertinggi</option>
            <option value="price">Harga Terendah</option>
          </select>
        </div>

        <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mb-6 uppercase tracking-widest">
          {filtered.length} vendor ditemukan
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((v) => (
            <Link key={v.id} to={`/vendor/${v.slug}`} className="group bg-white hover:shadow-[var(--shadow-luxury)] transition-shadow block">
              <div className="relative overflow-hidden aspect-[4/3]">
                <img src={v.img} alt={v.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                  {v.tags.map((t) => (
                    <span key={t} className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-[var(--color-dark)] text-[var(--color-cream)] font-[var(--font-sans)]">{t}</span>
                  ))}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-[var(--font-display)] text-lg text-[var(--color-dark)] group-hover:text-[var(--color-gold)] transition-colors">{v.name}</h3>
                  <span className="text-xs text-[var(--color-gold)] font-[var(--font-sans)] flex-shrink-0 mt-0.5">★ {v.rating} ({v.reviews})</span>
                </div>
                <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mb-2">{v.location} · {v.category}</p>
                {/* Paket tersedia */}
                <div className="flex gap-2 mb-3">
                  {v.packages.map((p) => (
                    <span key={p.tierId} className="text-[9px] uppercase tracking-widest px-2 py-0.5 border border-[var(--color-cream-border)] text-[var(--color-slate)] font-[var(--font-sans)]">
                      {p.tierId}
                    </span>
                  ))}
                </div>
                <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
                  Mulai {formatRupiah(Math.min(...v.packages.map(p => p.price)))}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VendorList
