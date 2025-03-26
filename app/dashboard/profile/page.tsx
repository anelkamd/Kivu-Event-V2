"use client"

import { useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { Event } from "@/types"
import { motion } from "framer-motion"
import { Tab } from "@headlessui/react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Image from "next/image"
import Link from "next/link"
import { PencilIcon, CalendarIcon, MapPinIcon, UserGroupIcon } from "@heroicons/react/24/outline"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { cn } from "@/lib/utils"

export default function Profile() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  const { data: createdEvents, isLoading: createdLoading } = useQuery<Event[]>(
    ["userCreatedEvents"],
    async () => {
      const response = await axios.get("/events", {
        params: { organizerId: user?.id },
      })
      return response.data.data
    },
    {
      enabled: !!user,
    },
  )

  const { data: joinedEvents, isLoading: joinedLoading } = useQuery<Event[]>(
    ["userJoinedEvents"],
    async () => {
      const response = await axios.get("/events/joined")
      return response.data.data
    },
    {
      enabled: !!user,
    },
  )

  const isLoading = createdLoading || joinedLoading

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profil Utilisateur</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <PencilIcon className="h-4 w-4" />
          {isEditing ? "Annuler" : "Modifier le profil"}
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="col-span-1"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative h-32 w-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                {user?.profileImage ? (
                  <Image
                    src={user.profileImage || "/placeholder.svg"}
                    alt={`${user.firstName} ${user.lastName}`}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <span className="text-4xl font-medium text-gray-700 dark:text-gray-300">
                      {user?.firstName?.charAt(0)}
                      {user?.lastName?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900 dark:text-white">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-gray-500 dark:text-gray-400">{user?.email}</p>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
            </div>

            {isEditing ? (
              <form className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    defaultValue={user?.firstName}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    defaultValue={user?.lastName}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Téléphone
                  </label>
                  <input
                    type="text"
                    id="phoneNumber"
                    name="phoneNumber"
                    defaultValue={user?.phoneNumber}
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Enregistrer les modifications
                </button>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Téléphone</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">{user?.phoneNumber || "Non renseigné"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Membre depuis</h3>
                  <p className="mt-1 text-sm text-gray-900 dark:text-white">
                    {user?.createdAt ? format(new Date(user.createdAt), "PPP", { locale: fr }) : "Non disponible"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="col-span-2"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <Tab.Group>
              <Tab.List className="flex border-b border-gray-200 dark:border-gray-700">
                <Tab
                  className={({ selected }) =>
                    cn(
                      "w-full py-4 text-sm font-medium text-center focus:outline-none",
                      selected
                        ? "text-primary border-b-2 border-primary"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                    )
                  }
                >
                  Événements créés ({createdEvents?.length || 0})
                </Tab>
                <Tab
                  className={({ selected }) =>
                    cn(
                      "w-full py-4 text-sm font-medium text-center focus:outline-none",
                      selected
                        ? "text-primary border-b-2 border-primary"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300",
                    )
                  }
                >
                  Événements rejoints ({joinedEvents?.length || 0})
                </Tab>
              </Tab.List>
              <Tab.Panels className="p-6">
                <Tab.Panel>
                  {createdEvents && createdEvents.length > 0 ? (
                    <div className="space-y-6">
                      {createdEvents.map((event) => (
                        <Link key={event.id} href={`/events/${event.id}`} className="block group">
                          <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="sm:w-1/4 relative h-32 rounded-md overflow-hidden">
                              {event.image ? (
                                <Image
                                  src={event.image || "/placeholder.svg"}
                                  alt={event.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                  <CalendarIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="sm:w-3/4 flex flex-col">
                              <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                  {event.title}
                                </h3>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    event.status === "published"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                      : event.status === "draft"
                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                                        : event.status === "cancelled"
                                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                  }`}
                                >
                                  {event.status === "published" && "Publié"}
                                  {event.status === "draft" && "Brouillon"}
                                  {event.status === "cancelled" && "Annulé"}
                                  {event.status === "completed" && "Terminé"}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {event.description}
                              </p>
                              <div className="mt-auto pt-4 flex flex-wrap gap-4">
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <CalendarIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                                  <time dateTime={event.startDate}>
                                    {format(new Date(event.startDate), "PPP", { locale: fr })}
                                  </time>
                                </div>
                                {event.venue && (
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <MapPinIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                                    {event.venue.name}, {event.venue.city}
                                  </div>
                                )}
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <UserGroupIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                                  {event.participants?.length || 0} / {event.capacity} participants
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">Vous n'avez pas encore créé d'événements.</p>
                      <Link
                        href="/dashboard/events/create"
                        className="mt-4 inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                      >
                        Créer un événement
                      </Link>
                    </div>
                  )}
                </Tab.Panel>
                <Tab.Panel>
                  {joinedEvents && joinedEvents.length > 0 ? (
                    <div className="space-y-6">
                      {joinedEvents.map((event) => (
                        <Link key={event.id} href={`/events/${event.id}`} className="block group">
                          <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="sm:w-1/4 relative h-32 rounded-md overflow-hidden">
                              {event.image ? (
                                <Image
                                  src={event.image || "/placeholder.svg"}
                                  alt={event.title}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                                  <CalendarIcon className="h-10 w-10 text-gray-400 dark:text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="sm:w-3/4 flex flex-col">
                              <div className="flex justify-between items-start">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                  {event.title}
                                </h3>
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    event.status === "published"
                                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                      : event.status === "draft"
                                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                                        : event.status === "cancelled"
                                          ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                          : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                                  }`}
                                >
                                  {event.status === "published" && "Publié"}
                                  {event.status === "draft" && "Brouillon"}
                                  {event.status === "cancelled" && "Annulé"}
                                  {event.status === "completed" && "Terminé"}
                                </span>
                              </div>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                                {event.description}
                              </p>
                              <div className="mt-auto pt-4 flex flex-wrap gap-4">
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <CalendarIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                                  <time dateTime={event.startDate}>
                                    {format(new Date(event.startDate), "PPP", { locale: fr })}
                                  </time>
                                </div>
                                {event.venue && (
                                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <MapPinIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                                    {event.venue.name}, {event.venue.city}
                                  </div>
                                )}
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                  <UserGroupIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                                  {event.participants?.length || 0} / {event.capacity} participants
                                </div>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">Vous n'avez pas encore rejoint d'événements.</p>
                      <Link
                        href="/events"
                        className="mt-4 inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                      >
                        Découvrir les événements
                      </Link>
                    </div>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

