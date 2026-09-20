const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export function buildApiUrl(path) {
  return `${API_BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`
}

export default API_BASE_URL
