"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import axios from "@/lib/axios"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { CalendarIcon, UsersIcon, MapPinIcon } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface DashboardStats {
    eventCount: number
    eventTrend: number
    participantCount: number
    participantTrend: number
    venueCount: number
    venueTrend: number
}

interface Event {
    id: string
    title: string
    description: string
    startDate: string
    endDate: string
    status: string
    // Autres propriétés...
}

export default function Dashboard() {
    const { user } = useAuth()
    const { toast } = useToast()
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [events, setEvents] = useState<Event[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            if (!user) return

            setIsLoading(true)
            try {
                console.log("Fetching dashboard data...")

                // Récupérer les statistiques
                const statsResponse = await axios.get("/api/dashboard/stats")
                console.log("Stats response:", statsResponse.data)
                setStats(statsResponse.data.data)

                // Récupérer les événements récents
                const eventsResponse = await axios.get("/api/events", {
                    params: { organizerId: user.id, limit: 5 },
                })
                console.log("Events response:", eventsResponse.data)
                setEvents(eventsResponse.data.data || [])
            } catch (error) {
                console.error("Error fetching dashboard data:", error)
                toast({
                    title: "Erreur",
                    description: "Impossible de charger les données du tableau de bord",
                    variant: "destructive",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchDashboardData()
    }, [user, toast])

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <LoadingSpinner size="lg" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tableau de bord</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-300">
                    Bienvenue, {user?.firstName}! Voici un aperçu de vos activités.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Événements</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-3xl font-bold">{stats?.eventCount || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.eventTrend && stats.eventTrend > 0 ? "+" : ""}
                                    {stats?.eventTrend || 0}% depuis le mois dernier
                                </p>
                            </div>
                            <div className="rounded-full bg-blue-100 p-3 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                                <CalendarIcon className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Participants</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-3xl font-bold">{stats?.participantCount || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.participantTrend && stats.participantTrend > 0 ? "+" : ""}
                                    {stats?.participantTrend || 0}% depuis le mois dernier
                                </p>
                            </div>
                            <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/20 dark:text-green-400">
                                <UsersIcon className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Lieux</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-3xl font-bold">{stats?.venueCount || 0}</div>
                                <p className="text-xs text-muted-foreground">
                                    {stats?.venueTrend && stats.venueTrend > 0 ? "+" : ""}
                                    {stats?.venueTrend || 0}% depuis le mois dernier
                                </p>
                            </div>
                            <div className="rounded-full bg-purple-100 p-3 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400">
                                <MapPinIcon className="h-6 w-6" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Événements récents</h2>
                    <Link href="/dashboard/events" className="text-sm font-medium text-primary hover:text-primary/90">
                        Voir tous les événements
                    </Link>
                </div>

                {events.length > 0 ? (
                    <div className="space-y-4">
                        {events.map((event) => (
                            <Card key={event.id}>
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <h3 className="font-medium">{event.title}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-1">{event.description}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-xs text-muted-foreground">
                          {new Date(event.startDate).toLocaleDateString("fr-FR")}
                        </span>
                                            </div>
                                        </div>
                                        <div>
                      <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              event.status === "published"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                  : event.status === "draft"
                                      ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
                          }`}
                      >
                        {event.status === "published"
                            ? "Publié"
                            : event.status === "draft"
                                ? "Brouillon"
                                : event.status === "cancelled"
                                    ? "Annulé"
                                    : "Terminé"}
                      </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <Card>
                        <CardContent className="p-6 text-center">
                            <p className="text-muted-foreground mb-4">Vous n'avez pas encore d'événements.</p>
                            <Link
                                href="/dashboard/events/create"
                                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90"
                            >
                                Créer un événement
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}