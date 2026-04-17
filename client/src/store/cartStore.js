// ============================================================
// src/store/cartStore.js
// AMARANTA = 1 vendor, cart hanya menyimpan PAKET yang dipilih
// Perubahan: tambah packageId ke item agar Checkout bisa kirim ke API
// ============================================================
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      // ── READ ──────────────────────────────────────────
      getTotal: () => get().items.reduce((a, i) => a + i.price, 0),
      getDP: () =>
        Math.round(get().items.reduce((a, i) => a + i.price, 0) * 0.3),

      // Cari item berdasarkan tierId (silver/gold/platinum)
      isInCart: (tierId) => get().items.some((i) => i.tierId === tierId),
      getByTier: (tierId) =>
        get().items.find((i) => i.tierId === tierId) || null,

      // ── CREATE / UPDATE ───────────────────────────────
      // AMARANTA hanya 1 vendor → cart hanya menyimpan 1 paket
      // Jika ganti paket → replace item lama
      addItem: (item) => {
        set(() => ({
          items: [
            {
              cartId: `amaranta-${item.tierId}-${Date.now()}`,
              vendorId: item.vendorId || 1,
              vendorName: item.vendorName || "AMARANTA Wedding Organizer",
              vendorSlug: item.vendorSlug || "amaranta",
              // packageId = ID numerik dari database (nanti dari API)
              // tierId    = slug: 'silver' | 'gold' | 'platinum'
              packageId: item.packageId || null,
              tierId: item.tierId,
              tierLabel: item.tierLabel,
              price: item.price,
              weddingDate: item.weddingDate || "",
              notes: item.notes || "",
            },
          ],
        }));
      },

      // Ganti tier paket
      updateTier: (tierId, tierLabel, price, packageId) => {
        set((s) => ({
          items: s.items.map((i) => ({
            ...i,
            tierId,
            tierLabel,
            price,
            packageId: packageId || i.packageId,
          })),
        }));
      },

      updateDate: (weddingDate) =>
        set((s) => ({ items: s.items.map((i) => ({ ...i, weddingDate })) })),
      updateNotes: (notes) =>
        set((s) => ({ items: s.items.map((i) => ({ ...i, notes })) })),
      removeItem: (tierId) =>
        set((s) => ({ items: s.items.filter((i) => i.tierId !== tierId) })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "amaranta-cart",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export default useCartStore;
