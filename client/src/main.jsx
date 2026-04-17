// ============================================================
// src/main.jsx
// Entry point: mounts React app ke DOM element #root di index.html
// StrictMode: mengaktifkan peringatan & pemeriksaan tambahan di dev
// ============================================================

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// createRoot(document.getElementById('root'))
//   → ambil elemen <div id="root"> dari index.html
//   → buat React root untuk concurrent rendering (React 18+)
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
