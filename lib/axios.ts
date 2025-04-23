import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"

const instance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
})

instance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token")
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
            console.log(`Request to ${config.url} with token`)
        } else {
            console.log(`Request to ${config.url} without token`)
        }
        return config
    },
    (error) => {
        console.error("Request error:", error)
        return Promise.reject(error)
    },
)

instance.interceptors.response.use(
    (response) => {
        console.log(`Response from ${response.config.url} successful`)
        return response
    },
    (error) => {
        console.error(`Error response from ${error.config?.url}:`, error.response?.status, error.message)

        if (error.response && error.response.status === 401) {
            console.log("Unauthorized access, redirecting to login")
            localStorage.removeItem("token")
            window.location.href = "/login"
        }

        return Promise.reject(error)
    },
)

export default instance