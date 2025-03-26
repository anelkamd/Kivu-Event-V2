"use client"

import type { Event } from "@/types"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import Link from "next/link"
import Image from "next/image"
import { CalendarIcon, MapPinIcon, UserGroupIcon } from "@heroicons/react/24/outline"
import { motion } from "framer-motion"

interface EventListProps {
  events: Event[]
}

export default function EventList({ events }: EventListProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
          className="event-card group relative overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm"
        >
          <Link href={`/events/${event.id}`} className="block">
            <div className="relative h-48 w-full overflow-hidden">
              {event.image ? (
                <Image
                  src={event.image || "/placeholder.svg"}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gray-200 dark:bg-gray-700">
                  <CalendarIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
              )}
              <div className="absolute top-2 right-2 rounded-full bg-white dark:bg-gray-800 px-2 py-1 text-xs font-medium">
                {event.type === "conference" && "Conférence"}
                {event.type === "seminar" && "Séminaire"}
                {event.type === "workshop" && "Atelier"}
                {event.type === "meeting" && "Réunion"}
              </div>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{event.title}</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{event.description}</p>
              <div className="mt-4 flex flex-col space-y-2">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <CalendarIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                  <time dateTime={event.startDate}>{format(new Date(event.startDate), "PPP", { locale: fr })}</time>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPinIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                  {event.venue.name}, {event.venue.city}
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <UserGroupIcon className="mr-1.5 h-4 w-4 flex-shrink-0" />
                  {event.participants.length} / {event.capacity} participants
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
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
                <span className="text-sm font-medium text-primary">Voir les détails</span>
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}

