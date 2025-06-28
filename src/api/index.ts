import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.API_BASE_URL,
  headers: {
    'x-api-key': import.meta.env.API_BASE_KEY,
  },
  withCredentials: true,
})

export default api
