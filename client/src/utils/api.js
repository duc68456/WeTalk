import axios from 'axios'

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