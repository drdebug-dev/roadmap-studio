import axios from 'axios'

const apiBaseUrl =
  import.meta.env.VITE_API_URL?.trim() || 'http://localhost:8000/api'

export const apiClient = axios.create({
  baseURL: apiBaseUrl,
})
