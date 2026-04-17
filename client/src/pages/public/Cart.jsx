import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import useCartStore from "../../store/cartStore";
import { MAIN_PACKAGES, formatRupiah } from "../../data/packages";
import Button from "../../components/ui/Button";
import useAuthStore from "../../store/authStore";

function Cart() {
  var items = useCartStore(function (s) {
    return s.items;
  });
  var removeItem = useCartStore(function (s) {
    return s.removeItem;
  });
  var updateDate = useCartStore(function (s) {
    return s.updateDate;
  });
  var clearCart = useCartStore(function (s) {
    return s.clearCart;
  });
  var getTotal = useCartStore(function (s) {
    return s.getTotal;
  });

  var isLoggedIn = useAuthStore(function (s) {
    return !!(s.token && s.user);
  });
  var navigate = useNavigate();

  // Hitung total secara langsung dari items (paling aman)
  var total = items.reduce(function (acc, i) {
    return acc + i.price;
  }, 0);
  var dp = Math.round(total * 0.3);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-cream)]">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="w-20 h-20 bg-[var(--color-parchment)] flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-10 h-10 text-[var(--color-slate)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h2 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-3">
            Keranjang Kosong
          </h2>
          <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)] mb-8">
            Tambahkan paket atau vendor ke keranjang Anda terlebih dahulu.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/paket"
              className="px-8 py-3.5 bg-[var(--color-gold)] text-[var(--color-dark)] text-xs uppercase tracking-widest font-[var(--font-sans)] font-medium hover:bg-[var(--color-gold-light)] transition-colors"
            >
              Lihat Paket
            </Link>
            <Link
              to="/vendor"
              className="px-8 py-3.5 border border-[var(--color-dark-muted)]/30 text-[var(--color-dark-muted)] text-xs uppercase tracking-widest font-[var(--font-sans)] hover:border-[var(--color-dark)] transition-colors"
            >
              Cari Vendor
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-cream)]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 lg:px-12 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-[var(--font-display)] text-3xl text-[var(--color-dark)] mb-1">
              Keranjang Saya
            </h1>
            <p className="text-sm text-[var(--color-slate)] font-[var(--font-sans)]">
              {items.length} item dipilih
            </p>
          </div>
          <button
            onClick={clearCart}
            className="text-xs text-red-400 hover:text-red-600 font-[var(--font-sans)] transition-colors"
          >
            Kosongkan keranjang
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Daftar item */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(function (item) {
              var mainPkg = MAIN_PACKAGES.find(function (p) {
                return p.id === item.tierId;
              });
              return (
                <div
                  key={item.cartId}
                  className="bg-white border border-[var(--color-cream-border)] p-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex-shrink-0"
                        style={{
                          backgroundColor: mainPkg ? mainPkg.color : "#C9A96E",
                        }}
                      />
                      <div>
                        <p className="font-[var(--font-display)] text-lg text-[var(--color-dark)]">
                          {item.vendorId === 0
                            ? "AMARANTA WO"
                            : item.vendorName}
                        </p>
                        <p
                          className="text-xs font-[var(--font-sans)]"
                          style={{ color: mainPkg ? mainPkg.color : "#C9A96E" }}
                        >
                          Paket {item.tierLabel}
                        </p>
                      </div>
                    </div>
                    <p className="font-[var(--font-display)] text-xl text-[var(--color-dark)] flex-shrink-0">
                      {formatRupiah(item.price)}
                    </p>
                  </div>

                  {/* Isi paket singkat */}
                  {mainPkg && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {mainPkg.includes.slice(0, 4).map(function (inc) {
                        return (
                          <span
                            key={inc.label}
                            className="text-[9px] uppercase tracking-widest px-2 py-0.5 bg-[var(--color-parchment)] text-[var(--color-dark-muted)] font-[var(--font-sans)]"
                          >
                            {inc.label}
                          </span>
                        );
                      })}
                      {mainPkg.includes.length > 4 && (
                        <span className="text-[9px] text-[var(--color-gold)] font-[var(--font-sans)]">
                          +{mainPkg.includes.length - 4} lainnya
                        </span>
                      )}
                    </div>
                  )}

                  {/* Tanggal + hapus */}
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-[var(--color-slate)] font-[var(--font-sans)] block mb-1">
                        Tanggal Pernikahan
                      </label>
                      <input
                        type="date"
                        value={item.weddingDate || ""}
                        onChange={function (e) {
                          updateDate(item.vendorId, e.target.value);
                        }}
                        min={new Date().toISOString().split("T")[0]}
                        className="text-sm border-b border-[var(--color-cream-border)] focus:border-[var(--color-gold)] bg-transparent outline-none py-1 font-[var(--font-sans)] text-[var(--color-dark)] transition-colors w-44"
                      />
                    </div>
                    <button
                      onClick={function () {
                        removeItem(item.vendorId);
                      }}
                      className="text-xs text-red-400 hover:text-red-600 font-[var(--font-sans)] transition-colors flex items-center gap-1"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Hapus
                    </button>
                  </div>
                </div>
              );
            })}

            <Link
              to="/vendor"
              className="flex items-center gap-2 text-xs text-[var(--color-gold)] hover:underline font-[var(--font-sans)] mt-2"
            >
              + Tambah vendor lain
            </Link>
          </div>

          {/* Ringkasan pesanan */}
          <div>
            <div className="sticky top-20 bg-white border border-[var(--color-cream-border)] p-6">
              <h2 className="font-[var(--font-display)] text-xl text-[var(--color-dark)] mb-5">
                Ringkasan
              </h2>

              <div className="space-y-3 mb-5">
                {items.map(function (item) {
                  var mainPkg = MAIN_PACKAGES.find(function (p) {
                    return p.id === item.tierId;
                  });
                  return (
                    <div
                      key={item.cartId}
                      className="flex justify-between text-sm font-[var(--font-sans)] gap-2"
                    >
                      <span className="text-[var(--color-dark-muted)] truncate pr-2">
                        {item.vendorId === 0 ? "AMARANTA" : item.vendorName}{" "}
                        <span
                          style={{ color: mainPkg ? mainPkg.color : "#C9A96E" }}
                        >
                          · {item.tierLabel}
                        </span>
                      </span>
                      <span className="text-[var(--color-dark)] flex-shrink-0">
                        {formatRupiah(item.price)}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="gold-rule mb-5" />

              <div className="space-y-2 mb-5">
                <div className="flex justify-between text-sm font-[var(--font-sans)]">
                  <span className="text-[var(--color-dark-muted)]">Total</span>
                  <span className="font-[var(--font-display)] text-xl text-[var(--color-dark)]">
                    {formatRupiah(total)}
                  </span>
                </div>
                <div className="flex justify-between text-xs font-[var(--font-sans)]">
                  <span className="text-[var(--color-slate)]">
                    DP minimum (30%)
                  </span>
                  <span className="text-[var(--color-gold)]">
                    {formatRupiah(dp)}
                  </span>
                </div>
              </div>

              <Button
                variant="gold"
                fullWidth
                size="lg"
                onClick={function () {
                  if (!isLoggedIn) {
                    navigate("/masuk");
                    return;
                  }
                  navigate("/checkout");
                }}
              >
                Lanjut ke Pembayaran
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[var(--color-slate)] font-[var(--font-sans)]">
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                Pembayaran aman & terenkripsi
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
