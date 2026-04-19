// src/hooks/useToast.js
// Toast notification global — pakai window event agar bisa dipanggil dari mana saja
export function showToast(message, type = "info", duration = 3000) {
  window.dispatchEvent(
    new CustomEvent("amaranta-toast", {
      detail: { message, type, duration, id: Date.now() },
    }),
  );
}

export function toast(message) {
  showToast(message, "info");
}
export function toastSuccess(message) {
  showToast(message, "success");
}
export function toastError(message) {
  showToast(message, "error");
}
