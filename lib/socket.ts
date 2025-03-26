"use client"

import { io, type Socket } from "socket.io-client"
import { useEffect, useState } from "react"
import Cookies from "js-cookie"

let socket: Socket | null = null

export const initializeSocket = (): Socket => {
  const token = Cookies.get("token")

  if (!socket && token) {
    socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", {
      auth: {
        token,
      },
    })

    console.log("Socket initialized")
  }

  return socket as Socket
}

export const getSocket = (): Socket | null => socket

export const closeSocket = (): void => {
  if (socket) {
    socket.close()
    socket = null
    console.log("Socket closed")
  }
}

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false)

  useEffect(() => {
    const socket = initializeSocket()

    const onConnect = () => {
      setIsConnected(true)
    }

    const onDisconnect = () => {
      setIsConnected(false)
    }

    socket.on("connect", onConnect)
    socket.on("disconnect", onDisconnect)

    if (socket.connected) {
      setIsConnected(true)
    }

    return () => {
      socket.off("connect", onConnect)
      socket.off("disconnect", onDisconnect)
    }
  }, [])

  return { socket: getSocket(), isConnected }
}

