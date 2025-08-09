"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Pagination from "@/components/ui/pagination"
import { CalendarDays, MapPin, Users, Eye, Edit, UserPlus, Clock, Euro, Share2, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type EventType = "all" | "my-events" | "my-participations" | "public"

export default function EventsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<EventType>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")

  const page = Number(searchParams.get("page")) || 1
  const limit = 12

  const queryParams = useMemo(() => {
    return {
      page,
      limit,
      search: searchTerm || undefined,
      type: filterType !== "all" ? filterType : undefined,
      tab: activeTab,
    }
  }, [page, limit, searchTerm, filterType, activeTab])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["events", queryParams],
    queryFn: async () => {
      let endpoint = "/api/events"

      switch (activeTab) {
        case "my-events":
          endpoint = "/api/events/my-events"
          break
        case "my-participations":
          endpoint = "/api/events/my-participations"
          break
        case "public":
          endpoint = "/api/events/public"
          break
        default:
          endpoint = "/api/events"
      }

      const response = await axios.get(endpoint, { params: queryParams })
      return response.data
    },
    placeholderData: (previousData) => previousData,
  })

  const handleJoinEvent = async (eventId: string) => {
    try {
      await axios.post(`/api/events/${eventId}/join`)
      refetch()
    } catch (error) {
      console.error("Erreur lors de l'inscription:", error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return "Date invalide" // Handle invalid date strings
    }
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      conference: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
      seminar: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      workshop: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
      meeting: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
      other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
      draft: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      completed: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100"
  }

  const EventCard = ({ event }: { event: any }) => (
    <Card className="group flex flex-col h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
          {event.image ? (
            <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CalendarDays className="w-16 h-16 text-white/70" />
            </div>
          )}
          <div className="absolute top-4 left-4 flex gap-2">
            <Badge className={getStatusColor(event.status)}>
              {event.status === "published"
                ? "Publié"
                : event.status === "draft"
                  ? "Brouillon"
                  : event.status === "cancelled"
                    ? "Annulé"
                    : "Terminé"}
            </Badge>
            <Badge className={getEventTypeColor(event.type)}>
              {event.type === "conference"
                ? "Conférence"
                : event.type === "seminar"
                  ? "Séminaire"
                  : event.type === "workshop"
                    ? "Atelier"
                    : event.type === "meeting"
                      ? "Réunion"
                      : "Autre"}
            </Badge>
          </div>
        </div>
      </div>

      <CardHeader className="pb-3 flex-grow">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-xl line-clamp-2 group-hover:text-blue-600 transition-colors dark:text-white dark:group-hover:text-blue-400">
            {event.title}
          </h3>
          {event.price > 0 && (
            <div className="flex items-center text-green-600 font-semibold ml-2 text-lg whitespace-nowrap">
              <Euro className="w-4 h-4 mr-1" />
              {event.price}
            </div>
          )}
        </div>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mt-2">{event.description}</p>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <CalendarDays className="w-4 h-4 mr-2 text-blue-500" />
          <span>{formatDate(event.start_date)}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
          <MapPin className="w-4 h-4 mr-2 text-red-500" />
          <span className="truncate">{event.venue?.name || "Lieu à définir"}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Users className="w-4 h-4 mr-2 text-green-500" />
            <span>
              {event.participants_count || 0}/{event.capacity} inscrits
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Avatar className="w-7 h-7">
              <AvatarImage src={event.organizer?.profile_image || "/placeholder.svg"} />
              <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                {event.organizer?.firstName?.charAt(0) || "O"}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-20">
              {event.organizer?.firstName || "Organisateur"}
            </span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-2 mt-auto">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 bg-transparent"
          onClick={() => router.push(`/events/detail/${event.id}`)}
        >
          <Eye className="w-4 h-4 mr-1" />
          Détails
        </Button>

        {activeTab === "my-events" ? (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
            onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Modifier
          </Button>
        ) : (
          activeTab !== "my-participations" &&
          event.status === "published" && (
            <Button
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
              onClick={() => handleJoinEvent(event.id)}
              disabled={event.participants_count >= event.capacity}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              {event.participants_count >= event.capacity ? "Complet" : "S'inscrire"}
            </Button>
          )
        )}
      </CardFooter>
    </Card>
  )

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(limit)].map((_, i) => (
        <Card key={i} className="overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="h-48 bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <CardHeader>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-2/3" />
            </div>
          </CardContent>
          <CardFooter className="pt-0 flex gap-2">
            <div className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
            <div className="h-9 w-full bg-gray-200 dark:bg-gray-700 rounded-md animate-pulse" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="w-full min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      <div className="max-w-[calc(100vw-250px)] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {" "}
        {/* Adjusted for sidebar */}
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
            Découvrez les Événements
          </h1>
          <p className="max-w-3xl mx-auto text-xl text-gray-600 dark:text-gray-300">
            Explorez une multitude d'événements, créez les vôtres et connectez-vous avec la communauté.
          </p>
        </div>
        {/* Tabs */}
        <div className="flex flex-wrap justify-center mb-10 border-b border-gray-200 dark:border-gray-700">
          {[
            { key: "all", label: "Tous les événements", icon: CalendarDays },
            { key: "my-events", label: "Mes événements", icon: Edit },
            { key: "my-participations", label: "Mes participations", icon: Users },
            { key: "public", label: "Événements publics", icon: Share2 },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as EventType)}
              className={`flex items-center px-8 py-4 text-lg font-semibold border-b-4 transition-all duration-200 ${
                activeTab === key
                  ? "border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600"
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {label}
            </button>
          ))}
        </div>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-10 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
            <Input
              placeholder="Rechercher un événement par titre ou description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full md:w-60 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500">
              <Filter className="w-5 h-5 mr-2 text-gray-400 dark:text-gray-500" />
              <SelectValue placeholder="Type d'événement" />
            </SelectTrigger>
            <SelectContent className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="conference">Conférence</SelectItem>
              <SelectItem value="seminar">Séminaire</SelectItem>
              <SelectItem value="workshop">Atelier</SelectItem>
              <SelectItem value="meeting">Réunion</SelectItem>
              <SelectItem value="other">Autre</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <div className="text-center py-20">
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-700 rounded-xl p-8 max-w-lg mx-auto shadow-lg">
              <div className="text-red-600 dark:text-red-400 mb-4">
                <Clock className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold text-red-800 dark:text-red-200 mb-3">Erreur de chargement</h3>
              <p className="text-red-700 dark:text-red-300 text-base mb-6">
                Une erreur s'est produite lors du chargement des événements. Veuillez vérifier votre connexion ou
                réessayer.
              </p>
              <Button
                variant="outline"
                size="lg"
                className="mt-4 border-red-400 text-red-600 hover:bg-red-100 dark:border-red-600 dark:text-red-400 dark:hover:bg-red-900 bg-transparent"
                onClick={() => refetch()}
              >
                Réessayer
              </Button>
            </div>
          </div>
        ) : data?.data?.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {data.data.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {data.pagination?.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination
                  currentPage={data.pagination.currentPage}
                  totalPages={data.pagination.totalPages}
                  baseUrl="/events"
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-10 max-w-lg mx-auto shadow-inner">
              <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Aucun événement trouvé</h3>
              <p className="text-gray-600 dark:text-gray-300 text-base mb-6">
                {activeTab === "my-events"
                  ? "Vous n'avez pas encore créé d'événement. Lancez-vous !"
                  : activeTab === "my-participations"
                    ? "Vous ne participez à aucun événement pour le moment. Découvrez de nouvelles opportunités !"
                    : "Aucun événement ne correspond à vos critères de recherche. Essayez d'ajuster vos filtres."}
              </p>
              {activeTab === "my-events" && (
                <Button
                  onClick={() => router.push("/dashboard/events/create")}
                  className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  Créer un événement
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
