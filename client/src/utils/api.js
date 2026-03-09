import axios from 'axios'

// Use relative base URL so the same build works on Heroku (same-origin)
// and locally when used with the Vite dev proxy.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

export function createApiClient(token) {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : undefined
  })
}
