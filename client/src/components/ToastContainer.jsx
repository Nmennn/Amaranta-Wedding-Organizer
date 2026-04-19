// src/components/ToastContainer.jsx
import { useState, useEffect } from "react";

export default function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    function handler(e) {
      const t = e.detail;
      setToasts((p) => [...p, t]);
      setTimeout(() => {
        setToasts((p) => p.filter((x) => x.id !== t.id));
      }, t.duration || 3000);
    }
    window.addEventListener("amaranta-toast", handler);
    return () => window.removeEventListener("amaranta-toast", handler);
  }, []);

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={"toast toast-" + t.type}>
          {t.type === "success" && "✓ "}
          {t.type === "error" && "⚠ "}
          {t.message}
        </div>
      ))}
    </div>
  );
}
