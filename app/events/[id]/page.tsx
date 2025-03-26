"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { Event } from "@/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Image from "next/image"
import {
  CalendarIcon,
  MapPinIcon,
  UserGroupIcon,
  ClockIcon,
  TagIcon,
  CurrencyEuroIcon,
} from "@heroicons/react/24/outline"
import { useAuth } from "@/context/AuthContext"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import PaymentModal from "@/components/payment/PaymentModal"
import toast from "react-hot-toast"

export default function EventDetailPage() {
  const { id } = useParams()
  const { user, isAuthenticated } = useAuth()
  const [isRegistering, setIsRegistering] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)

  const {
    data: event,
    isLoading,
    refetch,
  } = useQuery<Event>(["event", id], async () => {
    const response = await axios.get(`/events/${id}`)
    return response.data.data
  })

  const isRegistered = event?.participants?.some((p) => p.userId === user?.id)
  const isPaid = event?.price && event.price > 0

  const handleRegister = async () => {
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour vous inscrire à un événement")
      return
    }

    if (isPaid) {
      setIsPaymentModalOpen(true)
      return
    }

    try {
      setIsRegistering(true)
      await axios.post(`/events/${id}/register`)
      toast.success("Inscription réussie!")
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de l'inscription")
    } finally {
      setIsRegistering(false)
    }
  }

  const handleCancelRegistration = async () => {
    try {
      setIsRegistering(true)
      await axios.delete(`/events/${id}/register`)
      toast.success("Inscription annulée!")
      refetch()
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de l'annulation")
    } finally {
      setIsRegistering(false)
    }
  }

  const handlePaymentSuccess = () => {
    refetch()
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-gray-500 dark:text-gray-400">Événement non trouvé.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="relative h-64 sm:h-80 md:h-96">
          {event.image ? (
            <Image src={event.image || "/placeholder.svg"} alt={event.title} fill className="object-cover" />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <CalendarIcon className="h-16 w-16 text-gray-400 dark:text-gray-500" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex flex-wrap gap-2 mb-2">
              <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-0.5 text-sm font-medium text-blue-800 dark:text-blue-300">
                {event.type === "conference" && "Conférence"}
                {event.type === "seminar" && "Séminaire"}
                {event.type === "workshop" && "Atelier"}
                {event.type === "meeting" && "Réunion"}
              </span>
              <span
                className={`inline-flex items-center rounded-full px-3 py-0.5 text-sm font-medium ${
                  event.status === "published"
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : event.status === "draft"
                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
                      : event.status === "cancelled"
                        ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                }`}
              >
                {event.status === "published" && "Publié"}
                {event.status === "draft" && "Brouillon"}
                {event.status === "cancelled" && "Annulé"}
                {event.status === "completed" && "Terminé"}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-white">{event.title}</h1>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-6 mb-8">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <CalendarIcon className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <span>
                {format(new Date(event.startDate), "PPP", { locale: fr })}
                {" - "}
                {format(new Date(event.endDate), "PPP", { locale: fr })}
              </span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <ClockIcon className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <span>
                {format(new Date(event.startDate), "HH:mm", { locale: fr })}
                {" - "}
                {format(new Date(event.endDate), "HH:mm", { locale: fr })}
              </span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <MapPinIcon className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <span>
                {event.venue?.name}, {event.venue?.city}, {event.venue?.country}
              </span>
            </div>
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <UserGroupIcon className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" />
              <span>
                {event.participants?.length || 0} / {event.capacity} participants
              </span>
            </div>
            {event.price && event.price > 0 && (
              <div className="flex items-center text-gray-500 dark:text-gray-400">
                <CurrencyEuroIcon className="mr-2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <span>{(event.price / 100).toFixed(2)} €</span>
              </div>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
            <p className="text-gray-700 dark:text-gray-300">{event.description}</p>
          </div>

          {event.tags && event.tags.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-0.5 text-sm font-medium text-gray-800 dark:text-gray-200"
                  >
                    <TagIcon className="mr-1 h-4 w-4" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {event.agenda && event.agenda.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Programme</h2>
              <div className="space-y-4">
                {event.agenda.map((item) => (
                  <div key={item.id} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{item.title}</h3>
                      <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-gray-700 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:text-gray-200">
                        {item.type}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(item.startTime), "HH:mm", { locale: fr })}
                      {" - "}
                      {format(new Date(item.endTime), "HH:mm", { locale: fr })}
                    </p>
                    {item.description && (
                      <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">{item.description}</p>
                    )}
                    {item.speaker && (
                      <div className="mt-2 flex items-center">
                        <div className="flex-shrink-0">
                          {item.speaker.profileImage ? (
                            <div className="relative h-8 w-8 rounded-full overflow-hidden">
                              <Image
                                src={item.speaker.profileImage || "/placeholder.svg"}
                                alt={item.speaker.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {item.speaker.name.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.speaker.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.speaker.jobTitle}
                            {item.speaker.company && `, ${item.speaker.company}`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center mt-8">
            {isRegistered ? (
              <button
                onClick={handleCancelRegistration}
                disabled={isRegistering}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {isRegistering ? "Traitement en cours..." : "Annuler mon inscription"}
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={
                  isRegistering ||
                  event.status !== "published" ||
                  new Date() > new Date(event.registrationDeadline) ||
                  (event.participants?.length || 0) >= event.capacity
                }
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {isRegistering
                  ? "Traitement en cours..."
                  : isPaid
                    ? `S'inscrire (${(event.price! / 100).toFixed(2)} €)`
                    : "S'inscrire"}
              </button>
            )}
          </div>
        </div>
      </div>

      {isPaid && (
        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          eventId={event.id}
          eventTitle={event.title}
          price={event.price!}
          onSuccess={handlePaymentSuccess}
        />
      )}
    </div>
  )
}

