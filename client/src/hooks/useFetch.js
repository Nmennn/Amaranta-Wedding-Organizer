// ============================================================
// src/hooks/useFetch.js
// Generic hook untuk fetching data dari API.
// Menghindari penulisan loading/error state berulang-ulang
// di setiap komponen yang butuh data dari server.
//
// Pattern: useFetch(fetchFn, deps) → { data, loading, error, refetch }
// ============================================================

import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * Generic data fetching hook.
 *
 * @param {Function} fetchFn   - Async function yang memanggil API
 * @param {Array}    deps      - Dependency array (seperti useEffect)
 * @param {object}   options
 * @param {boolean}  options.immediate - Auto-fetch saat mount (default: true)
 *
 * @example
 * const { data, loading, error, refetch } = useFetch(
 *   () => vendorService.getAll({ page: 1 }),
 *   []
 * )
 */
const useFetch = (fetchFn, deps = [], { immediate = true } = {}) => {
  // ── State ──────────────────────────────────────────────────
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(immediate)
  const [error,   setError]   = useState(null)

  // useRef: menyimpan nilai yang tidak memicu re-render
  // isMounted: cegah setState setelah komponen di-unmount (memory leak)
  const isMounted = useRef(true)

  // ── Fetch function ─────────────────────────────────────────
  // useCallback: memoize fungsi agar tidak dibuat ulang tiap render
  // kecuali deps berubah → penting untuk deps useEffect di bawah
  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const result = await fetchFn()
      // Hanya update state jika komponen masih terpasang di DOM
      if (isMounted.current) {
        setData(result)
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.response?.data?.message || err.message || 'Terjadi kesalahan')
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  // ── Effect ─────────────────────────────────────────────────
  useEffect(() => {
    isMounted.current = true

    if (immediate) {
      execute()
    }

    // Cleanup: dijalankan saat komponen unmount
    // → set isMounted false agar async callbacks tidak setState
    return () => {
      isMounted.current = false
    }
  }, [execute, immediate])

  return {
    data,
    loading,
    error,
    refetch: execute,  // trigger manual re-fetch
    setData,           // untuk optimistic updates
  }
}

export default useFetch
