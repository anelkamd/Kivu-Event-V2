"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/AuthContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import { CalendarIcon, UsersIcon, MapPinIcon, PlayCircleIcon, ArrowRightIcon, StarIcon } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

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
    category: string
    image?: string
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

                // Utilisons des données statiques pour le moment puisque l'API n'est pas prête
                setStats({
                    eventCount: 12,
                    eventTrend: 5,
                    participantCount: 248,
                    participantTrend: 12,
                    venueCount: 8,
                    venueTrend: 3,
                })

                // Simulons également quelques événements
                setEvents([
                    {
                        id: "1",
                        title: "Conférence sur l'IA",
                        description: "Une conférence sur les dernières avancées en intelligence artificielle",
                        startDate: "2023-12-15T09:00:00",
                        endDate: "2023-12-15T17:00:00",
                        status: "published",
                        category: "Tech",
                    },
                    {
                        id: "2",
                        title: "Séminaire de développement web",
                        description: "Apprenez les meilleures pratiques en développement web moderne",
                        startDate: "2023-12-20T10:00:00",
                        endDate: "2023-12-21T16:00:00",
                        status: "draft",
                        category: "Formation",
                    },
                    {
                        id: "3",
                        title: "Workshop Design Thinking",
                        description: "Un atelier pratique sur la méthodologie Design Thinking",
                        startDate: "2024-01-05T09:30:00",
                        endDate: "2024-01-05T16:30:00",
                        status: "published",
                        category: "Design",
                    },
                ])
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

    // Récupérer l'heure actuelle
    const currentHour = new Date().getHours()
    // Déterminer la salutation en fonction de l'heure
    let greeting = "Bonjour"
    if (currentHour >= 18) {
        greeting = "Bonsoir"
    } else if (currentHour >= 12) {
        greeting = "Bon après-midi"
    } else if (currentHour >= 5) {
        greeting = "Bonjour"
    }

    // Récupérer le jour de la semaine
    const days = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"]
    const today = days[new Date().getDay()]
    const date = new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="col-span-1 lg:col-span-2 space-y-6">

                    <Card className="overflow-hidden bg-gradient-to-r from-primary/80 to-primary">
                        <CardContent className="p-6 text-white dark:text-black">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                <div>
                                    <h2 className="text-2xl font-bold mb-2">Développez vos compétences en gestion événementielle</h2>
                                    <p className="text-white/80 mb-6 dark:text-black">
                                        Utilisez Kivu Event pour organiser des événements professionnels de qualité
                                    </p>
                                    <Button variant="secondary" className="bg-white text-primary hover:bg-white/90 dark:bg-black dark:text-white/90">
                                        Créer un événement <ArrowRightIcon className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="flex justify-center">
                                    <div className="relative h-40 w-40">
                                        <svg
                                            viewBox="0 0 200 200"
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="absolute inset-0 h-full w-full text-white/20 dark:text-black/20"
                                        >
                                            <path
                                                fill="currentColor"
                                                d="M45.7,-58.2C59.1,-45.8,70.2,-31.5,74.7,-14.6C79.3,2.3,77.4,21.7,68.1,36.5C58.8,51.2,42.1,61.3,23.8,69.9C5.6,78.5,-14.2,85.6,-29.4,79.7C-44.6,73.9,-55.3,55.2,-65,36.3C-74.6,17.4,-83.2,-1.5,-80.8,-19.2C-78.4,-37,-65,-53.4,-49.1,-65.4C-33.2,-77.4,-14.9,-84.9,0.8,-85.9C16.5,-86.9,32.3,-81.4,45.7,-58.2Z"
                                                transform="translate(100 100)"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <CalendarIcon className="h-20 w-20 text-white dark:text-black" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Catégories d'événements</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <Card className="flex flex-col items-center p-4">
                                <div className="bg-primary/10 text-primary p-3 rounded-full mb-3">
                                    <StarIcon className="h-6 w-6" />
                                </div>
                                <h3 className="font-medium">Tech</h3>
                                <p className="text-xs text-muted-foreground">3 événements</p>
                            </Card>

                            <Card className="flex flex-col items-center p-4">
                                <div className="bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 p-3 rounded-full mb-3">
                                    <UsersIcon className="h-6 w-6" />
                                </div>
                                <h3 className="font-medium">Formation</h3>
                                <p className="text-xs text-muted-foreground">5 événements</p>
                            </Card>

                            <Card className="flex flex-col items-center p-4">
                                <div className="bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 p-3 rounded-full mb-3">
                                    <MapPinIcon className="h-6 w-6" />
                                </div>
                                <h3 className="font-medium">Design</h3>
                                <p className="text-xs text-muted-foreground">4 événements</p>
                            </Card>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold">Événements récents</h2>
                            <Link href="/dashboard/events" className="text-sm font-medium text-primary hover:text-primary/90">
                                Voir tout
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {events.map((event) => (
                                <Card key={event.id} className="overflow-hidden">
                                    <div className="relative h-36 bg-muted">
                                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                            <PlayCircleIcon className="h-12 w-12 text-muted-foreground/40" />
                                        </div>
                                    </div>
                                    <CardContent className="p-4">
                                        <div className="space-y-2">
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
                                            <h3 className="font-medium">{event.title}</h3>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <CalendarIcon className="mr-1 h-3 w-3" />
                                                {new Date(event.startDate).toLocaleDateString("fr-FR")}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="col-span-1 space-y-6">

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-semibold mb-4">
                                    {user?.firstName?.charAt(0) || "U"}
                                    {user?.lastName?.charAt(0) || ""}
                                </div>
                                <h3 className="text-lg font-semibold">
                                    {greeting} {user?.firstName || "Utilisateur"}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-2">
                                    {today}, {date}
                                </p>

                                <div className="w-full mt-4">
                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="flex flex-col items-center">
                                            <div className="text-2xl font-bold">{stats?.eventCount || 0}</div>
                                            <div className="text-xs text-muted-foreground">Événements</div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="text-2xl font-bold">{stats?.participantCount || 0}</div>
                                            <div className="text-xs text-muted-foreground">Participants</div>
                                        </div>
                                        <div className="flex flex-col items-center">
                                            <div className="text-2xl font-bold">{stats?.venueCount || 0}</div>
                                            <div className="text-xs text-muted-foreground">Lieux</div>
                                        </div>
                                    </div>

                                    <Link href="/dashboard/events/create">
                                        <Button className="w-full">Créer un nouvel événement</Button>
                                    </Link>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-md">Statistiques mensuelles</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="h-[180px] flex items-end gap-2 justify-between px-2">
                                {[40, 65, 45, 80, 75, 90].map((height, i) => (
                                    <div key={i} className="relative group">
                                        <div
                                            className="w-8 bg-white rounded-t-md transition-all duration-300 group-hover:bg-primary"
                                            style={{ height: `${height}%` }}
                                        ></div>
                                        <div className="text-xs text-muted-foreground mt-2">0{i + 1}/23</div>
                                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-foreground text-background rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            {height} participants
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-md">Prochains événements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 flex items-center justify-center">
                                        <CalendarIcon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">Conférence sur l'IA</p>
                                        <p className="text-xs text-muted-foreground">15 décembre 2025</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400 flex items-center justify-center">
                                        <CalendarIcon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">Séminaire de développement web</p>
                                        <p className="text-xs text-muted-foreground">20 décembre 2025</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400 flex items-center justify-center">
                                        <CalendarIcon className="h-5 w-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium truncate">Workshop Design Thinking</p>
                                        <p className="text-xs text-muted-foreground">5 Avril 2025</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

