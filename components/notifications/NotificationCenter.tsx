"use client"

import { useState, useEffect } from "react"
import { useSocket } from "@/lib/socket"
import { BellIcon } from "@heroicons/react/24/outline"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/context/AuthContext"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import axios from "@/lib/axios"
import { useQuery, useQueryClient } from "@tanstack/react-query"

interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  link?: string
  createdAt: string
}

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)
  const { socket, isConnected } = useSocket()
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: notifications = [], refetch } = useQuery<Notification[]>(
      ["notifications"],
      async () => {
        try {
          const response = await axios.get("/notifications")
          return response.data.data
        } catch (error) {
          console.error("Error fetching notifications:", error)
          return []
        }
      },
      {
        enabled: !!user,
        refetchOnWindowFocus: false,
      }
  )

  const unreadCount = notifications.filter((n) => !n.read).length

  useEffect(() => {
    if (socket && user) {
      const handleNewNotification = (notification: Notification) => {
        queryClient.setQueryData<Notification[]>(["notifications"], (old = []) => {
          return [notification, ...old]
        })
      }

      socket.on("notification", handleNewNotification)

      return () => {
        socket.off("notification", handleNewNotification)
      }
    }
  }, [socket, user, queryClient])

  const markAsRead = async (id: string) => {
    try {
      await axios.put(`/notifications/${id}/read`)
      queryClient.setQueryData<Notification[]>(["notifications"], (old = []) => {
        return old.map((n) => (n.id === id ? { ...n, read: true } : n))
      })
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axios.put("/notifications/read-all")
      queryClient.setQueryData<Notification[]>(["notifications"], (old = []) => {
        return old.map((n) => ({ ...n, read: true }))
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  return (
      <div className="relative">
        <button
            onClick={() => setIsOpen(!isOpen)}
            className="relative rounded-full p-2 text-gray-400 hover:bg-gray-800 focus:outline-none"
            aria-label="Notifications"
        >
          <BellIcon className="h-6 w-6" />
          {unreadCount > 0 && (
              <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-gray-900" />
          )}
        </button>

        <AnimatePresence>
          {isOpen && (
              <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 sm:w-96 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50"
              >
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                  <h3 className="text-lg font-medium text-white">Notifications</h3>
                  {unreadCount > 0 && (
                      <button onClick={markAllAsRead} className="text-sm text-gray-300 hover:text-white">
                        Tout marquer comme lu
                      </button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                      <div className="divide-y divide-gray-700">
                        {notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-4 ${notification.read ? "bg-gray-800" : "bg-gray-700"}`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="text-sm font-medium text-white">{notification.title}</p>
                                  <p className="mt-1 text-sm text-gray-400">{notification.message}</p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    {format(new Date(notification.createdAt), "PPp", { locale: fr })}
                                  </p>
                                </div>
                                {!notification.read && (
                                    <button
                                        onClick={() => markAsRead(notification.id)}
                                        className="text-xs text-gray-300 hover:text-white"
                                    >
                                      Marquer comme lu
                                    </button>
                                )}
                              </div>
                              {notification.link && (
                                  <a
                                      href={notification.link}
                                      className="mt-2 block text-sm font-medium text-gray-300 hover:text-white"
                                  >
                                    Voir les détails
                                  </a>
                              )}
                            </div>
                        ))}
                      </div>
                  ) : (
                      <div className="p-4 text-center text-gray-400">Aucune notification</div>
                  )}
                </div>
              </motion.div>
          )}
        </AnimatePresence>
      </div>
  )
}