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
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={event.organizer?.avatar || "/placeholder.svg"} alt={event.organizer?.name || "?"} />
                        <AvatarFallback>{event.organizer?.name?.charAt(0) || "?"}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{event.organizer?.name}</div>
                        <div className="text-xs text-muted-foreground">{event.category}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={cn("text-xs", statusColors[event.status])}>{statusLabels[event.status]}</Badge>
                    </div>
                  </div>
                  <h3 className="font-medium text-lg mb-2">{event.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{event.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(event.date).toLocaleDateString("fr-FR")}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {event.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {event.location}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-3 w-3 mr-1" />
                      {event.participants}/{event.maxParticipants}
                    </div>
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
        {selectedEvent ? (
          <div className="flex-1 bg-background md:border-l overflow-y-auto">
            <div className="sticky top-0 bg-background z-10 p-6 border-b">
              <div className="flex items-center justify-between mb-4">
                <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedEvent(null)}>
                  <X className="h-5 w-5" />
                </Button>
                <div className="flex items-center space-x-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="h-4 w-4 mr-2" />
                        Voir public
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex items-center space-x-3 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={selectedEvent.organizer?.avatar || "/placeholder.svg"}
                    alt={selectedEvent.organizer?.name || "?"}
                  />
                  <AvatarFallback>{selectedEvent.organizer?.name?.charAt(0) || "?"}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{selectedEvent.organizer?.name}</div>
                  <div className="text-sm text-muted-foreground">Organisateur • {selectedEvent.category}</div>
                </div>
              </div>
              <h2 className="text-2xl font-medium mb-2">{selectedEvent.title}</h2>
              <Badge className={cn("mb-4", statusColors[selectedEvent.status])}>
                {statusLabels[selectedEvent.status]}
              </Badge>
            </div>
            <div className="p-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Détails de l'événement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{selectedEvent.description}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Date</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(selectedEvent.date).toLocaleDateString("fr-FR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Heure</div>
                        <div className="text-sm text-muted-foreground">{selectedEvent.time}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Lieu</div>
                        <div className="text-sm text-muted-foreground">{selectedEvent.location}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="font-medium">Participants</div>
                        <div className="text-sm text-muted-foreground">
                          {selectedEvent.participants} / {selectedEvent.maxParticipants} inscrits
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <div className="flex space-x-2">
                <Button>
                  <Edit className="h-4 w-4 mr-2" />
                  Modifier l'événement
                </Button>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Voir les participants
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center bg-muted/5">
            <div className="text-center max-w-md p-8">
              <div className="bg-primary/5 p-6 rounded-full inline-block mb-4">
                <Calendar className="h-10 w-10 text-primary/80" />
              </div>
              <h3 className="text-xl font-medium mb-2">Gestion des événements</h3>
              <p className="text-muted-foreground mb-6">
                Sélectionnez un événement dans la liste pour voir ses détails et le modifier.
              </p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Créer un événement
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
