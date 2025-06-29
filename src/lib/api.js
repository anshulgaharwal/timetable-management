// src/lib/api.js

export async function apiRequest(url, options = {}) {
  const defaultHeaders = { "Content-Type": "application/json" }
  const mergedOptions = {
    method: options.method || "GET",
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    ...options,
  }
  try {
    const res = await fetch(url, mergedOptions)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) {
      throw new Error(data.message || "API request failed")
    }
    return data
  } catch (err) {
    throw new Error(err.message || "Network error")
  }
}
