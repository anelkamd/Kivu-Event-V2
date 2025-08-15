"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import { useSearchParams, useRouter } from "next/navigation"
import axios from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CalendarDays,
  MapPin,
  Users,
  Eye,
  UserPlus,
  Euro,
  Search,
  Filter,
  ArrowLeft,
  Clock,
  TrendingUp,
  Star,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Event {
  id: string
  title: string
  description: string
  type: "conference" | "seminar" | "workshop" | "meeting" | "other"
  start_date: string
  end_date: string
  capacity: number
  registration_deadline?: string
  status: "draft" | "published" | "cancelled" | "completed"
  price: number
  tags?: string
  image?: string
  venue_id?: string
  organizer_id: string
  created_at: string
  updated_at: string
  venue?: {
    id: string
    name: string
    address: string
    city: string
    country: string
  }
  organizer?: {
    id: string
    first_name: string
    last_name: string
    email: string
    profile_image?: string
  }
  participants_count?: number
}

export default function PublicEventsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("date")
  const [priceFilter, setPriceFilter] = useState<string>("all")

  const page = Number(searchParams.get("page")) || 1
  const limit = 12

  const queryParams = useMemo(() => {
    return {
      page,
      limit,
      search: searchTerm || undefined,
      type: filterType !== "all" ? filterType : undefined,
      sort: sortBy,
      status: "published", // Seulement les �v�nements publi�s
      price: priceFilter !== "all" ? priceFilter : undefined,
      include: "venue,organizer",
    }
  }, [page, limit, searchTerm, filterType, sortBy, priceFilter])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["public-events", queryParams],
    queryFn: async () => {
      const response = await axios.get("/api/events/public", { params: queryParams })
      return response.data
    },
    placeholderData: (previousData) => previousData,
  })

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Date invalide"
      }
      return date.toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch (error) {
      return "Date invalide"
    }
  }

  const formatDateShort = (dateString: string) => {
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) {
        return "Date invalide"
      }
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      })
    } catch (error) {
      return "Date invalide"
    }
  }

  const isEventSoon = (dateString: string) => {
    const eventDate = new Date(dateString)
    const now = new Date()
    const diffTime = eventDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 7 && diffDays > 0
  }

  const getEventTypeColor = (type: string) => {
    const colors = {
      conference: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-100",
      seminar: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100",
      workshop: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-100",
      meeting: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900 dark:text-orange-100",
      other: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-100",
    }
    return colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      conference: "Conf�rence",
      seminar: "S�minaire",
      workshop: "Atelier",
      meeting: "R�union",
      other: "Autre",
    }
    return labels[type as keyof typeof labels] || "Autre"
  }

  const EventCard = ({ event }: { event: Event }) => {
    const isSoon = isEventSoon(event.start_date)
    const isAlmostFull = event.participants_count && event.capacity && event.participants_count / event.capacity >= 0.8
    const isFull = event.participants_count && event.capacity && event.participants_count >= event.capacity

    return (
      <Card className="group relative flex flex-col h-full overflow-hidden border shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Image Header */}
        <div className="relative h-48 overflow-hidden">
          {event.image ? (
            <img
              src={
                event.image.startsWith("http")
                  ? event.image
                  : `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/${event.image}`
              }
              alt={event.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=200&width=400&text=Event"
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <CalendarDays className="w-16 h-16 text-primary/40" />
            </div>
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Date badge */}
          <div className="absolute top-3 left-3">
            <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">{formatDateShort(event.start_date).split(" ")[0]}</div>
                <div className="text-xs font-medium text-gray-600 uppercase">
                  {formatDateShort(event.start_date).split(" ")[1]}
                </div>
              </div>
            </div>
          </div>

          {/* Type badge */}
          <div className="absolute top-3 right-3">
            <Badge className={`${getEventTypeColor(event.type)} text-xs font-medium`}>{getTypeLabel(event.type)}</Badge>
          </div>

          {/* Indicateurs sp�ciaux */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            {isSoon && (
              <Badge className="bg-red-500 text-white text-xs animate-pulse">
                <Clock className="w-3 h-3 mr-1" />
                Bient�t
              </Badge>
            )}
            {isAlmostFull && !isFull && (
              <Badge className="bg-orange-500 text-white text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                Presque complet
              </Badge>
            )}
            {isFull && (
              <Badge className="bg-red-600 text-white text-xs">
                <Users className="w-3 h-3 mr-1" />
                Complet
              </Badge>
            )}
            {event.price === 0 && <Badge className="bg-green-500 text-white text-xs font-medium">Gratuit</Badge>}
          </div>

          {/* Prix */}
          {event.price > 0 && (
            <div className="absolute bottom-3 right-3">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1 shadow-sm border">
                <div className="flex items-center text-green-600 font-semibold text-sm">
                  <Euro className="w-3 h-3 mr-1" />
                  {event.price}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Contenu */}
        <CardHeader className="pb-3 flex-grow">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors leading-tight">
              {event.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">{event.description}</p>
          </div>
        </CardHeader>

        <CardContent className="space-y-3 pb-3">
          {/* Informations de l'�v�nement */}
          <div className="space-y-2">
            <div className="flex items-center text-sm text-muted-foreground">
              <CalendarDays className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
              <span className="truncate">{formatDate(event.start_date)}</span>
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
              <span className="truncate">
                {event.venue?.name || "Lieu � d�finir"}
                {event.venue?.city && `, ${event.venue.city}`}
              </span>
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <Users className="w-4 h-4 mr-2 flex-shrink-0 text-primary" />
              <span>
                {event.participants_count || 0}/{event.capacity} participants
              </span>
              <div className="ml-auto w-16 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isFull ? "bg-red-500" : isAlmostFull ? "bg-orange-500" : "bg-primary"
                  }`}
                  style={{
                    width: `${Math.min(((event.participants_count || 0) / event.capacity) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Organisateur */}
          {event.organizer && (
            <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg border">
              <Avatar className="w-8 h-8">
                <AvatarImage src={event.organizer.profile_image || "/placeholder.svg"} />
                <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                  {event.organizer.first_name?.charAt(0) || "O"}
                  {event.organizer.last_name?.charAt(0) || ""}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {event.organizer.first_name} {event.organizer.last_name}
                </p>
                <p className="text-xs text-muted-foreground">Organisateur</p>
              </div>
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
          )}

          {/* Tags */}
          {event.tags && (
            <div className="flex flex-wrap gap-1">
              {event.tags
                .split(",")
                .slice(0, 3)
                .map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    #{tag.trim()}
                  </Badge>
                ))}
              {event.tags.split(",").length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{event.tags.split(",").length - 3}
                </Badge>
              )}
            </div>
          )}
        </CardContent>

        {/* Actions */}
        <CardFooter className="pt-0 flex gap-2 mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 bg-transparent"
            onClick={() => router.push(`/events/detail/${event.id}`)}
          >
            <Eye className="w-4 h-4 mr-1" />
            D�tails
          </Button>

          <Button
            size="sm"
            className="flex-1"
            onClick={() => router.push(`/events/${event.id}/register`)}
            disabled={isFull}
          >
            <UserPlus className="w-4 h-4 mr-1" />
            {isFull ? "Complet" : "S'inscrire"}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(limit)].map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="h-48 w-full" />
          <CardHeader>
            <Skeleton className="h-5 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
          <CardFooter className="pt-0 flex gap-2">
            <Skeleton className="h-8 flex-1" />
            <Skeleton className="h-8 flex-1" />
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation */}
      <div className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => router.push("/")} className="font-semibold">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kivu Event
              </Button>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" onClick={() => router.push("/login")}>
                Se connecter
              </Button>
              <Button onClick={() => router.push("/register")}>S'inscrire</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl font-bold text-foreground mb-4 leading-tight">�v�nements Publics</h1>
          <p className="max-w-4xl mx-auto text-xl text-muted-foreground leading-relaxed">
            D�couvrez une s�lection d'�v�nements publics exceptionnels. Conf�rences, ateliers, s�minaires et bien plus
            vous attendent !
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-12 items-center">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un �v�nement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3"
            />
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full lg:w-48">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Type d'�v�nement" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="conference">Conf�rence</SelectItem>
                <SelectItem value="seminar">S�minaire</SelectItem>
                <SelectItem value="workshop">Atelier</SelectItem>
                <SelectItem value="meeting">R�union</SelectItem>
                <SelectItem value="other">Autre</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priceFilter} onValueChange={setPriceFilter}>
              <SelectTrigger className="w-full lg:w-48">
                <Euro className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Prix" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les prix</SelectItem>
                <SelectItem value="free">Gratuit</SelectItem>
                <SelectItem value="paid">Payant</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full lg:w-48">
                <SelectValue placeholder="Trier par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Titre</SelectItem>
                <SelectItem value="price">Prix</SelectItem>
                <SelectItem value="popularity">Popularit�</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <LoadingSkeleton />
        ) : isError ? (
          <div className="text-center py-20">
            <div className="bg-card border rounded-2xl p-12 max-w-lg mx-auto shadow-sm">
              <div className="text-destructive mb-6">
                <Clock className="w-16 h-16 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-4">Erreur de chargement</h3>
              <p className="text-muted-foreground text-base mb-8 leading-relaxed">
                Une erreur s'est produite lors du chargement des �v�nements. Veuillez v�rifier votre connexion ou
                r�essayer.
              </p>
              <Button variant="outline" size="lg" onClick={() => refetch()}>
                R�essayer
              </Button>
            </div>
          </div>
        ) : data?.data?.length > 0 ? (
          <>
            {/* Stats */}
            <div className="mb-8 text-center">
              <p className="text-muted-foreground">
                {data.pagination?.totalEvents || data.data.length} �v�nement
                {(data.pagination?.totalEvents || data.data.length) > 1 ? "s" : ""} trouv�
                {(data.pagination?.totalEvents || data.data.length) > 1 ? "s" : ""}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {data.data.map((event: Event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>

            {/* Pagination */}
            {data.pagination?.totalPages > 1 && (
              <div className="flex justify-center">
                <div className="bg-card rounded-xl shadow-sm p-2 border">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={data.pagination.currentPage <= 1}
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams.toString())
                        newParams.set("page", String(data.pagination.currentPage - 1))
                        router.push(`/events?${newParams.toString()}`)
                      }}
                    >
                      Pr�c�dent
                    </Button>

                    <span className="text-sm text-muted-foreground px-4">
                      Page {data.pagination.currentPage} sur {data.pagination.totalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={data.pagination.currentPage >= data.pagination.totalPages}
                      onClick={() => {
                        const newParams = new URLSearchParams(searchParams.toString())
                        newParams.set("page", String(data.pagination.currentPage + 1))
                        router.push(`/events?${newParams.toString()}`)
                      }}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <div className="bg-card border rounded-2xl p-12 max-w-lg mx-auto shadow-sm">
              <CalendarDays className="w-20 h-20 text-muted-foreground mx-auto mb-8" />
              <h3 className="text-3xl font-bold mb-4">Aucun �v�nement trouv�</h3>
              <p className="text-muted-foreground text-base mb-8 leading-relaxed">
                {searchTerm || filterType !== "all" || priceFilter !== "all"
                  ? "Aucun �v�nement ne correspond � vos crit�res de recherche. Essayez d'ajuster vos filtres."
                  : "Aucun �v�nement public disponible pour le moment. Revenez bient�t pour d�couvrir de nouveaux �v�nements !"}
              </p>
              {(searchTerm || filterType !== "all" || priceFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setFilterType("all")
                    setPriceFilter("all")
                    setSortBy("date")
                  }}
                >
                  R�initialiser les filtres
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
