// ============================================================
// src/pages/public/VendorDetail.jsx
// FIX: addItem sekarang sertakan vendorSlug, Navbar global
// ============================================================
import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import { VENDORS, MAIN_PACKAGES, formatRupiah } from "../../data/packages";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import useCartStore from "../../store/cartStore";
import useAuthStore from "../../store/authStore";

function VendorDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => !!(s.token && s.user));
  const addItem = useCartStore((s) => s.addItem);
  const isInCart = useCartStore((s) => s.isInCart);

  // Cari vendor dari data, fallback ke vendor[0]
  const vendor = VENDORS.find((v) => v.slug === slug) || VENDORS[0];

  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("tentang");
  const [addedTier, setAddedTier] = useState(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState(null);
  const [bookingForm, setBookingForm] = useState({ date: "", notes: "" });

  const allImgs = [vendor.img, ...(vendor.gallery || [])];

  function handleAddToCart(pkg) {
    if (!isLoggedIn) {
      navigate("/masuk");
      return;
    }
    const mainPkg = MAIN_PACKAGES.find((p) => p.id === pkg.tierId);
    addItem({
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorSlug: vendor.slug, // FIX: sertakan slug untuk link balik
      tierId: pkg.tierId,
      tierLabel: mainPkg?.tier || pkg.tierId,
      price: pkg.price,
      weddingDate: "",
      notes: "",
    });
    setAddedTier(pkg.tierId);
  }

  function handleOpenBooking(pkg) {
    if (!isLoggedIn) {
      navigate("/masuk");
      return;
    }
    setSelectedPkg(pkg);
    setBookingModal(true);
  }

  function handleSubmitBooking(e) {
    e.preventDefault();
    if (!bookingForm.date) {
      alert("Pilih tanggal pernikahan terlebih dahulu.");
      return;
    }
    // Tambah ke cart sekaligus
    const mainPkg = MAIN_PACKAGES.find((p) => p.id === selectedPkg.tierId);
    addItem({
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorSlug: vendor.slug,
      tierId: selectedPkg.tierId,
      tierLabel: mainPkg?.tier || selectedPkg.tierId,
      price: selectedPkg.price,
      weddingDate: bookingForm.date,
      notes: bookingForm.notes,
    });
    setAddedTier(selectedPkg.tierId);
    setBookingModal(false);
    navigate("/keranjang");
  }

  const TABS = [
    { id: "tentang", label: "Tentang Vendor" },
    { id: "paket", label: "Pilihan Paket" },
    { id: "tim", label: "Tim Kami" },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-6">
        <nav className="flex items-center gap-2 text-xs font-[var(--font-sans)] text-[var(--color-slate)]">
          <Link
            to="/"
            className="hover:text-[var(--color-dark)] transition-colors"
          >
            Beranda
          </Link>
          <span>/</span>
          <Link
            to="/vendor"
            className="hover:text-[var(--color-dark)] transition-colors"
          >
            Vendor
          </Link>
          <span>/</span>
          <span className="text-[var(--color-dark)] truncate max-w-[200px]">
            {vendor.name}
          </span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 pb-20 mt-6">
        {/* Galeri gambar */}
        <div className="grid grid-cols-4 gap-2 h-72 sm:h-96 mb-10 overflow-hidden">
          <div
            className="col-span-2 row-span-2 overflow-hidden cursor-pointer"
            onClick={() => setActiveImgIdx(0)}
          >
            <img
              src={allImgs[activeImgIdx]}
              alt="main"
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
            />
          </div>
          {allImgs.slice(1, 5).map((img, i) => (
            <div
              key={i}
              onClick={() => setActiveImgIdx(i + 1)}
              className={[
                "overflow-hidden cursor-pointer transition-opacity",
                activeImgIdx === i + 1
                  ? "ring-2 ring-[var(--color-gold)]"
                  : "hover:opacity-85",
              ].join(" ")}
            >
              <img
                src={img}
                alt={`foto ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-10">
          {/* Konten utama */}
          <div className="lg:col-span-2">
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {(vendor.tags || []).map((t) => (
                <Badge key={t} variant="gold">
                  {t}
                </Badge>
              ))}
            </div>

            <h1 className="font-[var(--font-display)] text-4xl lg:text-5xl text-[var(--color-dark)] mb-2">
              {vendor.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
                📍 {vendor.location}
              </span>
              <span className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
                🏷 {vendor.category}
              </span>
              <span className="text-sm text-[var(--color-gold)] font-[var(--font-sans)]">
                ★ {vendor.rating} ({vendor.reviews} ulasan)
              </span>
              <span className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
                📅 Berdiri {vendor.since}
              </span>
            </div>

            <div className="gold-rule mb-7" />

            {/* Tabs */}
            <div className="flex gap-0 mb-7 border-b border-[var(--color-cream-border)]">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "px-5 py-3 text-xs uppercase tracking-widest font-[var(--font-sans)] transition-all border-b-2 -mb-px whitespace-nowrap",
                    activeTab === tab.id
                      ? "border-[var(--color-gold)] text-[var(--color-dark)] font-medium"
                      : "border-transparent text-[var(--color-slate)] hover:text-[var(--color-dark)]",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab: Tentang */}
            {activeTab === "tentang" && (
              <div>
                {(vendor.description || "").split("\n\n").map((para, i) => (
                  <p
                    key={i}
                    className="text-sm text-[var(--color-dark-muted)] font-[var(--font-sans)] leading-relaxed mb-4"
                  >
                    {para}
                  </p>
                ))}
                <div className="grid grid-cols-3 gap-4 mt-8">
                  {[
                    { label: "Berdiri", value: vendor.since },
                    { label: "Ulasan", value: vendor.reviews + "+" },
                    { label: "Rating", value: vendor.rating + " / 5" },
                  ].map(({ label, value }) => (
                    <div
                      key={label}
                      className="text-center border border-[var(--color-cream-border)] p-4 bg-white"
                    >
                      <p className="font-[var(--font-display)] text-2xl text-[var(--color-gold)]">
                        {value}
                      </p>
                      <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] mt-1 uppercase tracking-widest">
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab: Paket */}
            {activeTab === "paket" && (
              <div className="space-y-5">
                {vendor.packages.map((pkg) => {
                  const mainPkg = MAIN_PACKAGES.find(
                    (p) => p.id === pkg.tierId,
                  );
                  if (!mainPkg) return null;
                  const added = addedTier === pkg.tierId || isInCart(vendor.id);
                  return (
                    <div
                      key={pkg.tierId}
                      className={[
                        "border p-6 bg-white transition-all",
                        added
                          ? "border-[var(--color-gold)] shadow-[var(--shadow-gold)]"
                          : "border-[var(--color-cream-border)] hover:border-[var(--color-gold)]/50",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex-shrink-0"
                            style={{ backgroundColor: mainPkg.color }}
                          />
                          <div>
                            <h3 className="font-[var(--font-display)] text-xl text-[var(--color-dark)]">
                              Paket {mainPkg.tier}
                            </h3>
                            <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                              {mainPkg.guests}
                            </p>
                          </div>
                        </div>
                        <p className="font-[var(--font-display)] text-2xl text-[var(--color-dark)]">
                          {formatRupiah(pkg.price)}
                        </p>
                      </div>
                      {/* Isi paket */}
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-5">
                        {mainPkg.includes.slice(0, 6).map((item) => (
                          <li
                            key={item.label}
                            className="flex items-center gap-2 text-xs text-[var(--color-dark-muted)] font-[var(--font-sans)]"
                          >
                            <svg
                              className="w-3.5 h-3.5 flex-shrink-0"
                              style={{ color: mainPkg.color }}
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
                        {mainPkg.includes.length > 6 && (
                          <li className="text-xs text-[var(--color-gold)] font-[var(--font-sans)] col-span-2">
                            +{mainPkg.includes.length - 6} layanan lainnya
                          </li>
                        )}
                      </ul>
                      {/* Tombol aksi */}
                      <div className="flex gap-3 flex-wrap">
                        <Button
                          variant={added ? "outline-gold" : "gold"}
                          size="sm"
                          onClick={() => handleAddToCart(pkg)}
                        >
                          {added
                            ? "✓ Ada di Keranjang"
                            : "🛒 Tambah ke Keranjang"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenBooking(pkg)}
                        >
                          📅 Pesan dengan Tanggal
                        </Button>
                      </div>
                    </div>
                  );
                })}

                {/* Link ke cart jika sudah tambah */}
                {isInCart(vendor.id) && (
                  <div className="flex items-center gap-3 p-4 bg-[var(--color-gold-pale)] border border-[var(--color-gold)]/50">
                    <svg
                      className="w-4 h-4 text-[var(--color-gold)]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-sm text-[var(--color-dark)] font-[var(--font-sans)]">
                      Vendor ini sudah ada di keranjang Anda.
                    </p>
                    <Link
                      to="/keranjang"
                      className="ml-auto text-xs text-[var(--color-gold)] hover:underline font-[var(--font-sans)] whitespace-nowrap"
                    >
                      Lihat Keranjang →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Tim */}
            {activeTab === "tim" && (
              <div className="grid sm:grid-cols-2 gap-4">
                {(vendor.team || []).map((member) => (
                  <div
                    key={member.name}
                    className="flex items-center gap-4 p-5 bg-white border border-[var(--color-cream-border)]"
                  >
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-14 h-14 rounded-full object-cover flex-shrink-0"
                    />
                    <div>
                      <p className="font-[var(--font-display)] text-lg text-[var(--color-dark)]">
                        {member.name}
                      </p>
                      <p className="text-xs text-[var(--color-gold)] font-[var(--font-sans)]">
                        {member.role}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar sticky */}
          <div>
            <div className="sticky top-20 bg-white border border-[var(--color-cream-border)] p-6 space-y-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-[var(--color-slate)] font-[var(--font-sans)] mb-1">
                  Harga mulai dari
                </p>
                <p className="font-[var(--font-display)] text-3xl text-[var(--color-dark)]">
                  {formatRupiah(
                    Math.min(...vendor.packages.map((p) => p.price)),
                  )}
                </p>
              </div>

              <div className="gold-rule" />

              <button
                onClick={() => setActiveTab("paket")}
                className="w-full py-3.5 bg-[var(--color-gold)] text-[var(--color-dark)] text-xs uppercase tracking-widest font-[var(--font-sans)] font-medium hover:bg-[var(--color-gold-light)] transition-colors"
              >
                Lihat Pilihan Paket
              </button>

              {isInCart(vendor.id) && (
                <Link
                  to="/keranjang"
                  className="block w-full py-3 text-center border border-[var(--color-gold)] text-[var(--color-gold)] text-xs uppercase tracking-widest font-[var(--font-sans)] hover:bg-[var(--color-gold-pale)] transition-colors"
                >
                  ✓ Lihat Keranjang
                </Link>
              )}

              <p className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] text-center">
                Tanpa biaya komitmen awal
              </p>

              <div className="pt-4 border-t border-[var(--color-cream-border)] space-y-2">
                {[
                  "Vendor terverifikasi AMARANTA",
                  "Pembayaran aman & terjamin",
                  "Konsultasi gratis",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 text-xs text-[var(--color-dark-muted)] font-[var(--font-sans)]"
                  >
                    <svg
                      className="w-3.5 h-3.5 text-[var(--color-gold)] flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pesan dengan tanggal */}
      <Modal
        isOpen={bookingModal}
        onClose={() => setBookingModal(false)}
        title={
          selectedPkg
            ? `Pesan: Paket ${MAIN_PACKAGES.find((p) => p.id === selectedPkg.tierId)?.tier}`
            : ""
        }
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBookingModal(false)}
            >
              Batal
            </Button>
            <Button variant="gold" size="sm" onClick={handleSubmitBooking}>
              Tambah ke Keranjang
            </Button>
          </>
        }
      >
        {selectedPkg && (
          <div className="space-y-5">
            {/* Info paket */}
            <div className="flex items-center justify-between p-4 bg-[var(--color-cream)] border border-[var(--color-cream-border)]">
              <div className="flex items-center gap-3">
                {(() => {
                  const pkg = MAIN_PACKAGES.find(
                    (p) => p.id === selectedPkg.tierId,
                  );
                  return pkg ? (
                    <>
                      <div
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: pkg.color }}
                      />
                      <span className="text-sm font-medium text-[var(--color-dark)] font-[var(--font-sans)]">
                        Paket {pkg.tier} — {vendor.name}
                      </span>
                    </>
                  ) : null;
                })()}
              </div>
              <span className="font-[var(--font-display)] text-lg text-[var(--color-dark)]">
                {formatRupiah(selectedPkg.price)}
              </span>
            </div>
            <Input
              label="Tanggal Pernikahan"
              type="date"
              value={bookingForm.date}
              onChange={(e) =>
                setBookingForm((p) => ({ ...p, date: e.target.value }))
              }
              min={new Date().toISOString().split("T")[0]}
              required
            />
            <div>
              <label className="text-sm font-medium text-[var(--color-dark-muted)] font-[var(--font-sans)] block mb-1.5">
                Catatan (opsional)
              </label>
              <textarea
                rows={3}
                value={bookingForm.notes}
                onChange={(e) =>
                  setBookingForm((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Tema warna, permintaan khusus..."
                className="w-full border-b-2 border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent text-sm font-[var(--font-sans)] text-[var(--color-dark)] resize-none outline-none py-2 transition-colors"
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default VendorDetail;