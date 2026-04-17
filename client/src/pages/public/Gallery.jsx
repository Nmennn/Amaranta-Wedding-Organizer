// ============================================================
// src/pages/public/Gallery.jsx — Galeri Foto & Video
// ============================================================
import { useState } from 'react'
import Navbar from '../../components/Navbar'
import { GALLERY_IMAGES } from '../../data/packages'

const CATS = ['Semua', 'Venue', 'Dekorasi', 'Foto', 'Resepsi', 'Katering', 'Hiburan']

const Gallery = () => {
  const [cat,    setCat]    = useState('Semua')
  const [active, setActive] = useState(null)

  const filtered = GALLERY_IMAGES.filter((g) => cat === 'Semua' || g.category === cat)

  return (
    <div className="min-h-screen bg-[var(--color-dark)]">
      <Navbar transparent theme="dark" />

      {/* Header */}
      <section className="pt-32 pb-12 px-6 lg:px-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-3">Koleksi Visual</p>
        <h1 className="font-[var(--font-display)] italic text-5xl lg:text-6xl text-[var(--color-cream)] mb-4">Galeri Kami</h1>
        <p className="text-sm text-white/50 font-[var(--font-sans)] max-w-md mx-auto">
          Setiap foto adalah sepotong kenangan yang kami bantu ciptakan bersama pasangan-pasangan luar biasa.
        </p>
      </section>

      {/* Filter */}
      <div className="flex flex-wrap justify-center gap-2 px-6 mb-10">
        {CATS.map((c) => (
          <button key={c} onClick={() => setCat(c)}
            className={['px-4 py-1.5 text-xs uppercase tracking-widest font-[var(--font-sans)] border transition-all', cat === c ? 'bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-dark)]' : 'border-white/20 text-white/50 hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]'].join(' ')}>
            {c}
          </button>
        ))}
      </div>

      {/* Masonry grid */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-20">
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3 space-y-3">
          {filtered.map((img) => (
            <div key={img.id} onClick={() => setActive(img)}
              className="break-inside-avoid overflow-hidden cursor-pointer group relative">
              <img src={img.src} alt={img.caption}
                className="w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110" />
              <div className="absolute inset-0 bg-[var(--color-dark)]/0 group-hover:bg-[var(--color-dark)]/40 transition-all duration-300 flex items-end p-3">
                <div className="translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-[10px] text-[var(--color-gold)] uppercase tracking-widest font-[var(--font-sans)]">{img.category}</p>
                  <p className="text-xs text-white font-[var(--font-sans)]">{img.caption}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {active && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setActive(null)}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={active.src} alt={active.caption} className="w-full max-h-[80vh] object-contain" />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 p-5">
              <p className="text-[10px] uppercase tracking-widest text-[var(--color-gold)] font-[var(--font-sans)]">{active.category}</p>
              <p className="text-sm text-white font-[var(--font-sans)]">{active.caption}</p>
            </div>
            <button onClick={() => setActive(null)}
              className="absolute top-3 right-3 w-9 h-9 bg-white/20 hover:bg-white/40 flex items-center justify-center transition-colors text-white">
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Gallery
