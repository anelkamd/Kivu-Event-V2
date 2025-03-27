"use client"

import { useAuth } from "@/context/AuthContext"
import { useQuery } from "@tanstack/react-query"
import axios from "@/lib/axios"
import type { Event } from "@/types"
import DashboardCard from "@/components/dashboard/DashboardCard"
import EventList from "@/components/events/EventList"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { motion } from "framer-motion"
import { CalendarIcon, UserGroupIcon, BuildingOfficeIcon } from "@heroicons/react/24/outline"
import Link from "next/link"

type DashboardStats = {
    eventCount: number
    eventTrend: number
    participantCount: number
    participantTrend: number
    venueCount: number
    venueTrend: number
}

export default function Dashboard() {
    const { user } = useAuth()

    const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
        queryKey: ["userEvents"],
        queryFn: async () => {
            if (!user?.id) return []
            const response = await axios.get("/events", {
                params: { organizerId: user.id, limit: 5 },
            })
            return response.data.data
        },
        enabled: !!user?.id,
    })

    const { data: stats, isLoading: statsLoading } = useQuery<DashboardStats>({
        queryKey: ["dashboardStats"],
        queryFn: async () => {
            if (!user?.id) return null
            const response = await axios.get("/dashboard/stats")
            return response.data.data
        },
        enabled: !!user?.id,
    })

    const isLoading = eventsLoading || statsLoading

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Bienvenue, {user?.firstName}! Voici un aperçu de vos activités.
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
                <DashboardCard
                    title="Événements"
                    value={stats?.eventCount || 0}
                    description="Événements organisés"
                    icon={<CalendarIcon className="h-6 w-6" />}
                    trend={stats?.eventTrend || 0}
                    color="blue"
                />
                <DashboardCard
                    title="Participants"
                    value={stats?.participantCount || 0}
                    description="Participants inscrits"
                    icon={<UserGroupIcon className="h-6 w-6" />}
                    trend={stats?.participantTrend || 0}
                    color="green"
                />
                <DashboardCard
                    title="Lieux"
                    value={stats?.venueCount || 0}
                    description="Lieux utilisés"
                    icon={<BuildingOfficeIcon className="h-6 w-6" />}
                    trend={stats?.venueTrend || 0}
                    color="purple"
                />
            </motion.div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="space-y-6"
            >
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Événements récents</h2>
                    <Link href="/dashboard/events" className="text-sm font-medium text-primary hover:text-primary/90">
                        Voir tous les événements
                    </Link>
                </div>
                {events?.length ? (
                    <EventList events={events} />
                ) : (
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                            Vous n'avez pas encore d'événements. Commencez par en créer un!
                        </p>
                        <Link
                            href="/dashboard/events/create"
                            className="mt-4 inline-flex items-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary/90"
                        >
                            Créer un événement
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
