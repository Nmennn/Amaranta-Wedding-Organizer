// ============================================================
// src/pages/public/Landing.jsx
// PERUBAHAN: FeaturedVendors diganti WhyUs (keunggulan AMARANTA)
// karena konsep berubah ke 1 vendor dengan 3 paket.
// Footer: hapus link /vendor. HowItWorks: "Pilih Vendor" → "Konsultasi".
// ============================================================
import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { PACKAGES, AMARANTA_INFO, formatRupiah } from "../../data/packages";

// ── HERO ─────────────────────────────────────────────────────
const Hero = () => (
  <section className="relative min-h-screen flex items-center overflow-hidden">
    <div className="absolute inset-0">
      <img
        src="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1600&q=90"
        alt="Pernikahan mewah"
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-dark)]/80 via-[var(--color-dark)]/40 to-transparent" />
    </div>
    <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full pt-16">
      <div className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-5 animate-fade-up">
          Wedding Organizer Terpercaya Sejak 2015
        </p>
        <h1 className="font-[var(--font-display)] text-5xl lg:text-7xl text-white leading-[1.05] mb-6 animate-fade-up animate-delay-100">
          Wujudkan
          <br />
          <em className="text-gold-shimmer not-italic">Pernikahan Impian</em>
          <br />
          Anda
        </h1>
        <p className="text-base text-white/70 font-[var(--font-sans)] leading-relaxed max-w-lg mb-10 animate-fade-up animate-delay-200">
          AMARANTA menghadirkan pengalaman pernikahan terbaik dengan tiga
          pilihan paket — Silver, Gold, dan Platinum — yang dirancang untuk
          setiap kebutuhan dan anggaran.
        </p>
        <div className="flex flex-wrap items-center gap-4 animate-fade-up animate-delay-300">
          <Link
            to="/paket"
            className="px-8 py-4 bg-[var(--color-gold)] text-[var(--color-dark)] text-xs uppercase tracking-widest font-[var(--font-sans)] font-medium hover:bg-[var(--color-gold-light)] transition-colors"
          >
            Lihat Paket Kami
          </Link>
          <Link
            to="/tentang"
            className="px-8 py-4 border border-white/30 text-white text-xs uppercase tracking-widest font-[var(--font-sans)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
          >
            Tentang Kami
          </Link>
        </div>
        <div className="flex flex-wrap gap-8 mt-14 animate-fade-up animate-delay-400">
          {AMARANTA_INFO.stats.map(({ value, label }) => (
            <div key={label}>
              <p className="font-[var(--font-display)] text-2xl text-[var(--color-gold)]">
                {value}
              </p>
              <p className="text-xs text-white/50 font-[var(--font-sans)] uppercase tracking-widest mt-0.5">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
      <span className="text-[10px] text-white/40 font-[var(--font-sans)] uppercase tracking-widest">
        Gulir
      </span>
      <svg
        className="w-4 h-4 text-white/40"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  </section>
);

// ── PAKET PREVIEW ─────────────────────────────────────────────
const PackagePreview = () => (
  <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
    <div className="text-center mb-12">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-3">
        Pilihan Paket
      </p>
      <h2 className="font-[var(--font-display)] text-4xl text-[var(--color-dark)] mb-3">
        Tiga Paket, Satu Momen Tak Terlupakan
      </h2>
      <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] max-w-md mx-auto">
        Setiap paket sudah termasuk koordinator hari H, dekorasi, katering, dan
        dokumentasi.
      </p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      {PACKAGES.map((pkg) => (
        <Link
          key={pkg.id}
          to="/paket"
          className={[
            "group relative border p-7 transition-all duration-300 hover:shadow-[var(--shadow-luxury)] bg-white",
            pkg.popular
              ? "border-[var(--color-gold)]"
              : "border-[var(--color-cream-border)]",
          ].join(" ")}
        >
          {pkg.popular && (
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-[var(--color-gold)] text-[var(--color-dark)] text-[10px] uppercase tracking-widest font-[var(--font-sans)] font-bold whitespace-nowrap">
              Paling Populer
            </div>
          )}
          <div
            className="w-10 h-10 rounded-full mb-4"
            style={{ background: pkg.color }}
          />
          <h3 className="font-[var(--font-display)] text-2xl text-[var(--color-dark)] mb-1">
            Paket {pkg.tier}
          </h3>
          <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mb-4">
            {pkg.tagline}
          </p>
          <p className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-1">
            {formatRupiah(pkg.price)}
          </p>
          <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mb-6">
            {pkg.guests}
          </p>
          <ul className="space-y-1.5 mb-6">
            {pkg.includes.slice(0, 4).map((item) => (
              <li
                key={item.label}
                className="flex items-center gap-2 text-xs text-[var(--color-dark-muted)] font-[var(--font-sans)]"
              >
                <svg
                  className="w-3.5 h-3.5 flex-shrink-0"
                  style={{ color: pkg.color }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {item.label}
              </li>
            ))}
            {pkg.includes.length > 4 && (
              <li className="text-xs text-[var(--color-gold)] font-[var(--font-sans)]">
                +{pkg.includes.length - 4} layanan lainnya →
              </li>
            )}
          </ul>
          <div
            className={[
              "w-full py-2.5 text-center text-xs uppercase tracking-widest font-[var(--font-sans)] transition-all border",
              pkg.popular
                ? "bg-[var(--color-gold)] border-[var(--color-gold)] text-[var(--color-dark)]"
                : "border-[var(--color-dark-muted)]/30 text-[var(--color-dark-muted)] group-hover:border-[var(--color-gold)] group-hover:text-[var(--color-gold)]",
            ].join(" ")}
          >
            Lihat Detail
          </div>
        </Link>
      ))}
    </div>
    <div className="text-center">
      <Link
        to="/paket"
        className="inline-flex items-center gap-2 text-xs text-[var(--color-gold)] hover:underline font-[var(--font-sans)] uppercase tracking-widest"
      >
        Bandingkan semua paket →
      </Link>
    </div>
  </section>
);

// ── KEUNGGULAN AMARANTA (ganti FeaturedVendors) ───────────────
// Sebelumnya: loop VENDORS yang sudah tidak ada banyak entri.
// Sekarang: tampilkan keunggulan AMARANTA sebagai 1 WO.
const WhyUs = () => (
  <section className="py-20 bg-[var(--color-parchment)]">
    <div className="max-w-7xl mx-auto px-6 lg:px-12">
      <div className="text-center mb-14">
        <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-2">
          Mengapa AMARANTA
        </p>
        <h2 className="font-[var(--font-display)] text-4xl text-[var(--color-dark)]">
          Kami Urus Segalanya, Anda Menikmati Momennya
        </h2>
      </div>

      {/* Tim unggulan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-14">
        {AMARANTA_INFO.team.map((member) => (
          <div
            key={member.name}
            className="bg-white border border-[var(--color-cream-border)] p-5 text-center hover:shadow-[var(--shadow-card)] transition-shadow"
          >
            <img
              src={member.img}
              alt={member.name}
              className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border-2 border-[var(--color-gold-pale)]"
            />
            <p className="font-[var(--font-display)] text-base text-[var(--color-dark)] mb-0.5">
              {member.name}
            </p>
            <p className="text-xs text-[var(--color-gold)] font-[var(--font-sans)]">
              {member.role}
            </p>
          </div>
        ))}
      </div>

      {/* Keunggulan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                />
              </svg>
            ),
            title: "Sudah Terverifikasi",
            desc: "Tim berpengalaman sejak 2015 dengan 500+ pernikahan sukses.",
          },
          {
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ),
            title: "Koordinator Dedicated",
            desc: "Setiap pasangan mendapat koordinator personal dari awal hingga hari H.",
          },
          {
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ),
            title: "Harga Transparan",
            desc: "Tidak ada biaya tersembunyi. Semua sudah tertulis jelas di setiap paket.",
          },
          {
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            ),
            title: "Dokumentasi Profesional",
            desc: "Setiap paket sudah termasuk fotografer berpengalaman.",
          },
          {
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            ),
            title: "Detail yang Diperhatikan",
            desc: "Dari undangan sampai bunga meja, semuanya kami tangani dengan penuh cinta.",
          },
          {
            icon: (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            ),
            title: "Dukungan 24/7",
            desc: "Tim kami selalu siap dihubungi untuk konsultasi dan pertanyaan kapan pun.",
          },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-4 bg-white border border-[var(--color-cream-border)] p-5"
          >
            <div className="w-10 h-10 bg-[var(--color-gold-pale)] flex items-center justify-center text-[var(--color-gold)] flex-shrink-0">
              {icon}
            </div>
            <div>
              <h3 className="font-[var(--font-display)] text-lg text-[var(--color-dark)] mb-1">
                {title}
              </h3>
              <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] leading-relaxed">
                {desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ── CARA KERJA ────────────────────────────────────────────────
const HowItWorks = () => (
  <section className="py-20 px-6 lg:px-12 max-w-5xl mx-auto">
    <div className="text-center mb-12">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-3">
        Cara Pesan
      </p>
      <h2 className="font-[var(--font-display)] text-4xl text-[var(--color-dark)]">
        Mudah dalam 4 Langkah
      </h2>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
      {[
        {
          step: "01",
          title: "Pilih Paket",
          desc: "Pilih Silver, Gold, atau Platinum sesuai kebutuhan & anggaran Anda.",
        },
        {
          step: "02",
          title: "Konsultasi",
          desc: "Tim kami akan menghubungi Anda untuk mendiskusikan detail pernikahan.",
        },
        {
          step: "03",
          title: "Bayar DP",
          desc: "Lakukan pembayaran DP 30% untuk mengamankan tanggal pernikahan Anda.",
        },
        {
          step: "04",
          title: "Nikmati Hari H",
          desc: "Kami urus semuanya — Anda cukup hadir dan menikmati momen.",
        },
      ].map(({ step, title, desc }) => (
        <div key={step} className="text-center group">
          <div className="w-14 h-14 border-2 border-[var(--color-gold)]/30 flex items-center justify-center mx-auto mb-4 group-hover:border-[var(--color-gold)] transition-colors">
            <span className="font-[var(--font-display)] text-xl text-[var(--color-gold)]">
              {step}
            </span>
          </div>
          <h3 className="font-[var(--font-display)] text-lg text-[var(--color-dark)] mb-2">
            {title}
          </h3>
          <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] leading-relaxed">
            {desc}
          </p>
        </div>
      ))}
    </div>
  </section>
);

// ── GALERI PREVIEW ────────────────────────────────────────────
const GalleryPreview = () => {
  const imgs = [
    "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=600&q=80",
    "https://images.unsplash.com/photo-1537907690979-9abfc7ad4eaf?w=600&q=80",
    "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80",
    "https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80",
    "https://images.unsplash.com/photo-1487530811015-780780169993?w=600&q=80",
  ];
  return (
    <section className="py-20 bg-[var(--color-dark)]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-2">
              Koleksi Foto
            </p>
            <h2 className="font-[var(--font-display)] italic text-4xl text-[var(--color-cream)]">
              Galeri Kami
            </h2>
          </div>
          <Link
            to="/galeri"
            className="text-xs text-[var(--color-gold)] hover:underline font-[var(--font-sans)] uppercase tracking-widest"
          >
            Lihat semua →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {imgs.map((src, i) => (
            <div
              key={i}
              className={[
                "overflow-hidden group",
                i === 0 ? "md:col-span-2 md:row-span-2" : "",
              ].join(" ")}
            >
              <img
                src={src}
                alt={"Galeri " + (i + 1)}
                className={[
                  "w-full object-cover transition-all duration-700 group-hover:scale-105 group-hover:brightness-110",
                  i === 0 ? "h-full min-h-[280px]" : "h-36",
                ].join(" ")}
              />
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/galeri"
            className="inline-block px-10 py-3.5 border border-white/20 text-white/70 text-xs uppercase tracking-widest font-[var(--font-sans)] hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] transition-all"
          >
            Lihat Galeri Lengkap
          </Link>
        </div>
      </div>
    </section>
  );
};

// ── TESTIMONI ─────────────────────────────────────────────────
const Testimonials = () => (
  <section className="py-20 px-6 lg:px-12 max-w-7xl mx-auto">
    <div className="text-center mb-12">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--color-gold)] font-[var(--font-sans)] mb-3">
        Kata Mereka
      </p>
      <h2 className="font-[var(--font-display)] text-4xl text-[var(--color-dark)]">
        Pasangan yang Telah Mempercayai Kami
      </h2>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[
        {
          name: "Rina & Budi",
          pkg: "Paket Gold",
          rating: 5,
          text: '"Tim AMARANTA luar biasa! Dari dekorasi, katering, sampai dokumentasi semuanya sempurna. Pernikahan kami melebihi ekspektasi."',
        },
        {
          name: "Sari & Doni",
          pkg: "Paket Platinum",
          rating: 5,
          text: '"Paket Platinum benar-benar worth it. Honeymoon Bali termasuk dan semuanya sudah diatur. Kami tidak perlu pusing sama sekali!"',
        },
        {
          name: "Maya & Reza",
          pkg: "Paket Silver",
          rating: 5,
          text: '"Dengan budget terbatas, Paket Silver sudah sangat lengkap. Koordinatornya super responsif dan pernikahan kami berjalan lancar."',
        },
      ].map(({ name, pkg, rating, text }) => (
        <div
          key={name}
          className="bg-white border border-[var(--color-cream-border)] p-7"
        >
          <div className="flex items-center gap-1 mb-4">
            {Array.from({ length: rating }).map((_, i) => (
              <span key={i} className="text-[var(--color-gold)] text-sm">
                ★
              </span>
            ))}
          </div>
          <p className="text-sm text-[var(--color-dark-muted)] font-[var(--font-serif)] italic leading-relaxed mb-5">
            {text}
          </p>
          <div>
            <p className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
              {name}
            </p>
            <p className="text-xs text-[var(--color-gold)] font-[var(--font-sans)]">
              {pkg}
            </p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

// ── CTA BAWAH ─────────────────────────────────────────────────
const BottomCTA = () => {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <section className="py-20 px-6 bg-[var(--color-cream)] border-t border-[var(--color-cream-border)]">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-3">
          Dapatkan Inspirasi Pernikahan
        </h2>
        <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] mb-8">
          Daftarkan email Anda untuk mendapatkan tips & promo eksklusif dari
          AMARANTA.
        </p>
        {sent ? (
          <p className="text-sm text-[var(--color-gold)] font-[var(--font-sans)]">
            Terima kasih! Anda sudah terdaftar.
          </p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (email) setSent(true);
            }}
            className="flex items-center max-w-sm mx-auto"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Anda"
              required
              className="flex-1 px-4 py-3 border border-r-0 border-[var(--color-cream-border)] bg-white text-sm font-[var(--font-sans)] text-[var(--color-dark)] outline-none focus:border-[var(--color-gold)] transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-[var(--color-dark)] text-[var(--color-cream)] text-xs uppercase tracking-widest font-[var(--font-sans)] hover:bg-[var(--color-charcoal)] transition-colors whitespace-nowrap"
            >
              Daftar
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

// ── FOOTER ─────────────────────────────────────────────────────
const Footer = () => (
  <footer className="bg-[var(--color-dark)] py-12 px-6 lg:px-12">
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
        <div className="md:col-span-2">
          <Link
            to="/"
            className="font-[var(--font-display)] text-2xl text-[var(--color-cream)] tracking-widest block mb-3"
          >
            AMARANTA
          </Link>
          <p className="text-sm text-white/50 font-[var(--font-sans)] leading-relaxed max-w-xs">
            Wedding Organizer profesional yang telah membantu lebih dari 500
            pasangan mewujudkan pernikahan impian mereka sejak 2015.
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-gold)] font-[var(--font-sans)] mb-4">
            Navigasi
          </p>
          <div className="space-y-2">
            {[
              ["Beranda", "/"],
              ["Paket", "/paket"],
              ["Galeri", "/galeri"],
              ["Perencanaan", "/perencanaan"],
              ["Tentang", "/tentang"],
            ].map(([label, to]) => (
              <Link
                key={to}
                to={to}
                className="block text-sm text-white/50 hover:text-white/80 font-[var(--font-sans)] transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[var(--color-gold)] font-[var(--font-sans)] mb-4">
            Kontak
          </p>
          <div className="space-y-2 text-sm text-white/50 font-[var(--font-sans)]">
            <p>📍 {AMARANTA_INFO.location}</p>
            <p>📞 {AMARANTA_INFO.phone}</p>
            <p>✉️ {AMARANTA_INFO.email}</p>
            <p>📸 {AMARANTA_INFO.instagram}</p>
            <p>🕐 Senin–Sabtu, 09.00–18.00</p>
          </div>
        </div>
      </div>
      <div className="gold-rule mb-6" />
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-white/30 font-[var(--font-sans)] uppercase tracking-widest">
          © {new Date().getFullYear()} AMARANTA Wedding Organizer. All rights
          reserved.
        </p>
        <div className="flex gap-5">
          {["Privasi", "Syarat & Ketentuan", "Karir"].map((item) => (
            <Link
              key={item}
              to="#"
              className="text-[10px] text-white/30 hover:text-white/60 font-[var(--font-sans)] transition-colors"
            >
              {item}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

// ── HALAMAN UTAMA ─────────────────────────────────────────────
const Landing = () => (
  <div className="bg-[var(--color-cream)]">
    <Navbar transparent theme="dark" />
    <Hero />
    <PackagePreview />
    <div className="gold-rule" />
    <WhyUs />
    <HowItWorks />
    <div className="gold-rule" />
    <GalleryPreview />
    <Testimonials />
    <BottomCTA />
    <Footer />
  </div>
);

export default Landing;
