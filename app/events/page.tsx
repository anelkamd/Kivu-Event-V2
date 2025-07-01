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
import { CalendarDays, MapPin, Users, Eye, Edit, Clock, Euro, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type EventType = "my-events" | "my-participations"

export default function EventsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<EventType>("my-events")
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
    }
  }, [page, limit, searchTerm, filterType])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["events", activeTab, queryParams],
    queryFn: async () => {
      const endpoint = activeTab === "my-events" ? "/api/events/my-events" : "/api/events/my-participations"
      const response = await axios.get(endpoint, { params: queryParams })
      return response.data
    },
    placeholderData: (previousData) => previousData,
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      conference: "bg-blue-100 text-blue-800",
      seminar: "bg-green-100 text-green-800",
      workshop: "bg-purple-100 text-purple-800",
      meeting: "bg-orange-100 text-orange-800",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const getStatusColor = (status: string) => {
    const colors = {
      published: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      cancelled: "bg-red-100 text-red-800",
      completed: "bg-gray-100 text-gray-800",
    }
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const EventCard = ({ event }: { event: any }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 relative overflow-hidden">
          {event.image ? (
            <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <CalendarDays className="w-16 h-16 text-white/70" />
            </div>
          )}
          <div className="absolute top-4 left-4">
            <Badge className={getStatusColor(event.status)}>
              {event.status === "published"
                ? "Publié"
                : event.status === "draft"
                  ? "Brouillon"
                  : event.status === "cancelled"
                    ? "Annulé"
                    : "Terminé"}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <Badge className={getEventTypeColor(event.type)}>
              {event.type === "conference"
                ? "Conférence"
                : event.type === "seminar"
                  ? "Séminaire"
                  : event.type === "workshop"
                    ? "Atelier"
                    : "Réunion"}
            </Badge>
          </div>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg line-clamp-2 group-hover:text-blue-600 transition-colors">{event.title}</h3>
          {event.price > 0 && (
            <div className="flex items-center text-green-600 font-semibold ml-2">
              <Euro className="w-4 h-4 mr-1" />
              {event.price}
            </div>
          )}
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 mt-2">{event.description}</p>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <div className="flex items-center text-sm text-gray-600">
          <CalendarDays className="w-4 h-4 mr-2 text-blue-500" />
          <span>{formatDate(event.start_date)}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <MapPin className="w-4 h-4 mr-2 text-red-500" />
          <span className="truncate">{event.venue?.name || "Lieu à définir"}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-600">
            <Users className="w-4 h-4 mr-2 text-green-500" />
            <span>
              {event.participants_count || 0}/{event.capacity} inscrits
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Avatar className="w-6 h-6">
              <AvatarImage src={event.organizer?.profile_image || "/placeholder.svg?height=24&width=24"} />
              <AvatarFallback className="text-xs">{event.organizer?.name?.charAt(0) || "O"}</AvatarFallback>
            </Avatar>
            <span className="text-xs text-gray-500 truncate max-w-20">{event.organizer?.name || "Organisateur"}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 bg-transparent"
          onClick={() => router.push(`/events/${event.id}`)}
        >
          <Eye className="w-4 h-4 mr-1" />
          Détails
        </Button>

        {activeTab === "my-events" && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
            onClick={() => router.push(`/dashboard/events/${event.id}/edit`)}
          >
            <Edit className="w-4 h-4 mr-1" />
            Modifier
          </Button>
        )}
      </CardFooter>
    </Card>
  )

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <div className="h-48 bg-gray-200 animate-pulse" />
          <CardHeader>
            <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
            <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mes Événements</h1>
        <p className="mt-2 text-gray-600">Gérez vos événements créés et vos participations</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap mb-8 border-b bg-white rounded-t-lg">
        <button
          onClick={() => setActiveTab("my-events")}
          className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "my-events"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Edit className="w-4 h-4 mr-2" />
          Mes événements créés
        </button>
        <button
          onClick={() => setActiveTab("my-participations")}
          className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "my-participations"
              ? "border-blue-500 text-blue-600"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          <Users className="w-4 h-4 mr-2" />
          Mes participations
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-white p-4 rounded-lg shadow-sm">
        <div className="flex-1">
          <Input
            placeholder="Rechercher un événement..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Type d'événement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="conference">Conférence</SelectItem>
            <SelectItem value="seminar">Séminaire</SelectItem>
            <SelectItem value="workshop">Atelier</SelectItem>
            <SelectItem value="meeting">Réunion</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : isError ? (
        <div className="text-center py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 mb-2">
              <Clock className="w-8 h-8 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de chargement</h3>
            <p className="text-red-600 text-sm">Une erreur s'est produite lors du chargement des événements.</p>
            <Button variant="outline" size="sm" className="mt-4 bg-transparent" onClick={() => refetch()}>
              Réessayer
            </Button>
          </div>
        </div>
      ) : data?.data?.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {data.data.map((event: any) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

          {data.pagination?.totalPages > 1 && (
            <div className="flex justify-center">
              <Pagination
                currentPage={data.pagination.page}
                totalPages={data.pagination.totalPages}
                baseUrl="/events"
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <div className="bg-white border-2 border-dashed border-gray-200 rounded-lg p-8 max-w-md mx-auto">
            <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun événement trouvé</h3>
            <p className="text-gray-500 text-sm mb-4">
              {activeTab === "my-events"
                ? "Vous n'avez pas encore créé d'événement."
                : "Vous ne participez à aucun événement pour le moment."}
            </p>
            {activeTab === "my-events" && (
              <Button onClick={() => router.push("/dashboard/events/create")}>Créer un événement</Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
