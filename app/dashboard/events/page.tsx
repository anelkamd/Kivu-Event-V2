"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, MapPin, Users, Search, Plus, MoreHorizontal, Edit, Trash2, Eye, Star, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  published: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  ongoing: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  completed: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const statusLabels = {
  draft: "Brouillon",
  published: "Publié",
  ongoing: "En cours",
  completed: "Terminé",
  cancelled: "Annulé",
}

function formatDate(dateStr: string) {
  if (!dateStr) return ""
  
  const date = new Date(dateStr.replace(" ", "T"))
  return isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("fr-FR", { year: "numeric", month: "long", day: "numeric" })
}

export default function EventsPage() {
  const [filter, setFilter] = useState<string>("all")
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [visibleEvents, setVisibleEvents] = useState<any[]>([])
  const [allEvents, setAllEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Récupère les événements de l'utilisateur connecté
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true)
      try {
        const token = localStorage.getItem("token")
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/my-events`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await res.json()
        if (data.success && Array.isArray(data.data)) {
          setAllEvents(data.data)
          setVisibleEvents(data.data)
        } else {
          setAllEvents([])
          setVisibleEvents([])
        }
      } catch (err) {
        setAllEvents([])
        setVisibleEvents([])
      }
      setLoading(false)
    }
    fetchEvents()
  }, [])

  const filterEvents = (filterType: string, query: string) => {
    let filtered = [...allEvents]
    if (filterType !== "all") {
      filtered = filtered.filter((event) => event.status === filterType)
    }
    if (query) {
      const lowercaseQuery = query.toLowerCase()
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(lowercaseQuery) ||
          event.description.toLowerCase().includes(lowercaseQuery) ||
          event.location.toLowerCase().includes(lowercaseQuery)
      )
    }
    setVisibleEvents(filtered)
  }

  const handleFilterChange = (filterType: string) => {
    setFilter(filterType)
    filterEvents(filterType, searchQuery)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterEvents(filter, query)
  }

  // Fonction pour copier le lien
  const handleCopyLink = (eventId: string) => {
    const url = `${window.location.origin}/events/${eventId}`
    navigator.clipboard.writeText(url)
  }

  // Fonction pour rediriger vers les tâches
  const handleGoToTasks = (eventId: string) => {
    window.location.href = `/dashboard/tasks?eventId=${eventId}`
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-medium">Événements</h1>
          <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-normal">
            {visibleEvents.length} événement{visibleEvents.length > 1 ? "s" : ""}
          </Badge>
        </div>
        <div className="flex items-center space-x-2">
          {showSearch ? (
            <div className="relative">
              <Input
                placeholder="Rechercher..."
                className="w-64 pr-8"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                autoFocus
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full"
                onClick={() => {
                  setShowSearch(false)
                  setSearchQuery("")
                  filterEvents(filter, "")
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setShowSearch(true)}>
              <Search className="h-5 w-5" />
            </Button>
          )}
          <Button className="rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel événement
          </Button>
        </div>
      </div>

      {/* Filter chips */}
      <div className="px-6 py-4 flex items-center space-x-2 border-b">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange("all")}
        >
          Tous
        </Button>
        <Button
          variant={filter === "published" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange("published")}
        >
          Publiés
        </Button>
        <Button
          variant={filter === "draft" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange("draft")}
        >
          Brouillons
        </Button>
        <Button
          variant={filter === "ongoing" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange("ongoing")}
        >
          En cours
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Events list */}
        <div className={cn("w-full md:w-2/5 overflow-y-auto p-6", selectedEvent ? "hidden md:block" : "block")}>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <span>Chargement...</span>
            </div>
          ) : (
            visibleEvents.length > 0 ? (
              visibleEvents.map((event) => (
                <div
                  key={event.id}
                  className={cn(
                    "mb-4 p-4 rounded-xl cursor-pointer transition-all bg-card hover:bg-muted/50",
                    selectedEvent?.id === event.id ? "ring-2 ring-primary/20" : "hover:shadow-sm",
                  )}
                  onClick={() => setSelectedEvent(event)}
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={event.image || "/placeholder.svg"} alt={event.title} />
                      <AvatarFallback>{event.title?.charAt(0) || "?"}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs text-muted-foreground">{event.type}</div>
                    </div>
                  </div>
                  <div className="mb-2 text-sm text-muted-foreground line-clamp-2">{event.description}</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    <Badge>{event.status}</Badge>
                    <Badge variant="outline">{event.tags}</Badge>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground gap-4">
                    <Calendar className="h-3 w-3 mr-1" />
                    {formatDate(event.start_date)} - {formatDate(event.end_date)}
                    <Users className="h-3 w-3 ml-4 mr-1" />
                    {event.participants_count ?? 0} participants
                    <MapPin className="h-3 w-3 ml-4 mr-1" />
                    {event.venue_id}
                    <Star className="h-3 w-3 ml-4 mr-1" />
                    {event.price} €
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-64 p-4 text-center">
                <div className="bg-muted/50 p-4 rounded-full mb-4">
                  <Calendar className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Aucun événement</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Aucun événement ne correspond à votre recherche" : "Créez votre premier événement"}
                </p>
              </div>
            )
          )}
        </div>

        {/* Event detail */}
        {selectedEvent && (
          <div className="flex-1 bg-background md:border-l overflow-y-auto">
            {/* Couverture */}
            <div className="relative w-full h-48 md:h-64 mb-4">
              <img
                src={selectedEvent.image || "/placeholder.svg"}
                alt={selectedEvent.title}
                className="object-cover w-full h-full rounded-b-xl"
                style={{ objectPosition: "center" }}
              />
              <div className="absolute bottom-4 left-6 text-white text-2xl font-bold drop-shadow-lg">
                {selectedEvent.title}
              </div>
            </div>
            <div className="sticky top-0 bg-background z-10 p-6 border-b">
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedEvent.image || "/placeholder.svg"} alt={selectedEvent.title} />
                  <AvatarFallback>{selectedEvent.title?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedEvent.title}</div>
                  <div className="text-sm text-muted-foreground">{selectedEvent.type}</div>
                </div>
              </div>
              <h2 className="text-2xl font-medium mb-2">{selectedEvent.title}</h2>
              <Badge className="mb-4">{selectedEvent.status}</Badge>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(selectedEvent.id)}
                >
                  Copier le lien
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleGoToTasks(selectedEvent.id)}
                >
                  Voir les tâches
                </Button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Détails de l'événement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{selectedEvent.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="font-medium">Type</div>
                      <div className="text-sm text-muted-foreground">{selectedEvent.type}</div>
                    </div>
                    <div>
                      <div className="font-medium">Date</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(selectedEvent.start_date)} - {formatDate(selectedEvent.end_date)}
                      </div>
                    </div>
                    <div>
                      <div className="font-medium">Capacité</div>
                      <div className="text-sm text-muted-foreground">{selectedEvent.capacity} places</div>
                    </div>
                    <div>
                      <div className="font-medium">Lieu</div>
                      <div className="text-sm text-muted-foreground">{selectedEvent.venue_id}</div>
                    </div>
                    <div>
                      <div className="font-medium">Prix</div>
                      <div className="text-sm text-muted-foreground">{selectedEvent.price} €</div>
                    </div>
                    <div>
                      <div className="font-medium">Tags</div>
                      <div className="text-sm text-muted-foreground">{selectedEvent.tags}</div>
                    </div>
                    <div>
                      <div className="font-medium">Participants</div>
                      <div className="text-sm text-muted-foreground">{selectedEvent.participants_count ?? 0}</div>
                    </div>
                    <div>
                      <div className="font-medium">Lien complet</div>
                      <div className="text-sm text-muted-foreground break-all">
                        <a href={`/events/${selectedEvent.id}`} target="_blank" rel="noopener noreferrer">
                          {window.location.origin}/events/{selectedEvent.id}
                        </a>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
