import axios from "axios"
import Cookies from "js-cookie"

const instance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Ajouter le token d'authentification à chaque requête
instance.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Gérer les erreurs de réponse
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Rediriger vers la page de connexion si le token est expiré ou invalide
    if (error.response?.status === 401) {
      Cookies.remove("token")
      if (typeof window !== "undefined") {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default instance

