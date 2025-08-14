import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

const instance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add request interceptor
instance.interceptors.request.use(
  (config) => {
    // Access localStorage only if window is defined (i.e., on the client)
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token")
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Add response interceptor
instance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Ensure window is defined before accessing localStorage or redirecting
    if (typeof window !== "undefined") {
      const status = error.response?.status
      if (status === 401) {
        localStorage.removeItem("token")
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default instance