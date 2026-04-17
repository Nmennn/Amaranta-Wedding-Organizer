import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Badge from "../../components/ui/Badge";
import Pagination from "../../components/ui/Pagination";
import { VENDORS, formatRupiah } from "../../data/packages";

const KATEGORI = [
  "Semua",
  "Venue & Full Service",
  "Dekorasi & Florist",
  "Fotografer & Videografer",
  "Venue Outdoor",
  "Musik & Hiburan",
  "Katering",
];
const SORT_OPT = [
  "Rating Tertinggi",
  "Harga Terendah",
  "Harga Tertinggi",
  "Nama A–Z",
];

function Search() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Semua");
  const [sort, setSort] = useState("Rating Tertinggi");
  const [page, setPage] = useState(1);
  const PER_PAGE = 9;

  const filtered = VENDORS.filter(
    (v) => category === "Semua" || v.category === category,
  )
    .filter(
      (v) =>
        !query ||
        v.name.toLowerCase().includes(query.toLowerCase()) ||
        v.location.toLowerCase().includes(query.toLowerCase()) ||
        v.category.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => {
      if (sort === "Harga Terendah")
        return (
          Math.min(...a.packages.map((p) => p.price)) -
          Math.min(...b.packages.map((p) => p.price))
        );
      if (sort === "Harga Tertinggi")
        return (
          Math.min(...b.packages.map((p) => p.price)) -
          Math.min(...a.packages.map((p) => p.price))
        );
      if (sort === "Nama A–Z") return a.name.localeCompare(b.name);
      return b.rating - a.rating; // default: rating tertinggi
    });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />

      {/* Hero search header */}
      <div className="bg-[var(--color-dark)] pt-16">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 py-12">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-3">
            Temukan Vendor Terbaik
          </p>
          <h1 className="font-[var(--font-display)] text-4xl text-[var(--color-cream)] mb-6">
            Direktori Vendor AMARANTA
          </h1>
          <div className="relative max-w-lg">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Cari vendor, kategori, atau lokasi..."
              className="w-full pl-11 pr-4 py-3.5 bg-white/10 border border-white/20 text-[var(--color-cream)] placeholder:text-white/40 text-sm font-[var(--font-sans)] outline-none focus:border-[var(--color-gold)] transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Filter & sort */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {KATEGORI.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setCategory(cat);
                  setPage(1);
                }}
                className={[
                  "px-4 py-1.5 text-xs uppercase tracking-widest font-[var(--font-sans)] border transition-all",
                  category === cat
                    ? "bg-[var(--color-dark)] text-[var(--color-cream)] border-[var(--color-dark)]"
                    : "border-[var(--color-cream-border)] text-[var(--color-dark-muted)] hover:border-[var(--color-dark)]",
                ].join(" ")}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
              Urutkan:
            </span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="text-xs font-[var(--font-sans)] border border-[var(--color-cream-border)] bg-white px-3 py-2 text-[var(--color-dark-muted)] outline-none focus:border-[var(--color-gold)] transition-colors"
            >
              {SORT_OPT.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Hasil */}
        <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mb-5 uppercase tracking-widest">
          {filtered.length} vendor ditemukan
        </p>

        {/* Grid vendor */}
        {paginated.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-[var(--font-display)] text-2xl text-[var(--color-dark-subtle)] mb-3">
              Vendor tidak ditemukan
            </p>
            <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
              Coba kata kunci atau kategori yang berbeda.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {paginated.map((vendor) => (
              <Link
                key={vendor.id}
                to={`/vendor/${vendor.slug}`}
                className="group bg-white hover:shadow-[var(--shadow-luxury)] transition-all duration-300 block"
              >
                {/* Gambar */}
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={vendor.img}
                    alt={vendor.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1">
                    {vendor.tags.map((t) => (
                      <span
                        key={t}
                        className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-[var(--color-dark)]/80 text-[var(--color-cream)] font-[var(--font-sans)]"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="absolute top-3 right-3 bg-white/90 px-2 py-0.5 text-xs font-[var(--font-sans)] text-[var(--color-gold)]">
                    ★ {vendor.rating}
                  </div>
                </div>
                {/* Info */}
                <div className="p-5">
                  <h3 className="font-[var(--font-display)] text-lg text-[var(--color-dark)] group-hover:text-[var(--color-gold)] transition-colors mb-1">
                    {vendor.name}
                  </h3>
                  <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mb-2">
                    {vendor.location} · {vendor.category}
                  </p>
                  {/* Badge paket tersedia */}
                  <div className="flex gap-1.5 mb-3">
                    {vendor.packages.map((p) => {
                      const colors = {
                        silver: "#A8B8C8",
                        gold: "#C9A96E",
                        platinum: "#B8A9C9",
                      };
                      return (
                        <span
                          key={p.tierId}
                          className="text-[9px] uppercase tracking-widest px-2 py-0.5 border border-[var(--color-cream-border)] font-[var(--font-sans)]"
                          style={{ color: colors[p.tierId] }}
                        >
                          {p.tierId}
                        </span>
                      );
                    })}
                  </div>
                  <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
                    Mulai{" "}
                    {formatRupiah(
                      Math.min(...vendor.packages.map((p) => p.price)),
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

export default Search;
