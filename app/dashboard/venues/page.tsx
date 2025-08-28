"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MapPin,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  Calendar,
  Phone,
  Mail,
  Star,
  X,
  Building,
  DollarSign,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Venue {
  id: string
  name: string
  address: string
  city: string
  capacity: number
  type: "hotel" | "conference" | "restaurant" | "outdoor" | "other"
  pricePerDay: number
  contact: {
    name: string
    phone: string
    email: string
  }
  amenities: string[]
  description: string
  status: "available" | "booked" | "maintenance"
  isStarred: boolean
  image?: string
}

const mockVenues: Venue[] = [
  {
    id: "1",
    name: "Hôtel Marriott Kinshasa",
    address: "Avenue des Aviateurs",
    city: "Kinshasa",
    capacity: 300,
    type: "hotel",
    pricePerDay: 1500,
    contact: {
      name: "Marie Lukaku",
      phone: "+243 123 456 789",
      email: "events@marriott-kinshasa.com",
    },
    amenities: ["WiFi", "Climatisation", "Projecteur", "Sonorisation", "Parking"],
    description: "Salle de conférence moderne avec équipements audiovisuels complets",
    status: "available",
    isStarred: true,
    image: "/hotel-conference-room.png",
  },
  {
    id: "2",
    name: "Centre GSOLUTECH",
    address: "Boulevard du 30 Juin",
    city: "Kinshasa",
    capacity: 50,
    type: "conference",
    pricePerDay: 500,
    contact: {
      name: "Jean Kabongo",
      phone: "+243 987 654 321",
      email: "contact@gsolutech.org",
    },
    amenities: ["WiFi", "Tableau blanc", "Projecteur", "Climatisation"],
    description: "Centre de formation idéal pour workshops et formations techniques",
    status: "booked",
    isStarred: false,
    image: "/modern-training-center.png",
  },
  {
    id: "3",
    name: "Restaurant Le Fleuve",
    address: "Avenue de la Révolution",
    city: "Kinshasa",
    capacity: 120,
    type: "restaurant",
    pricePerDay: 800,
    contact: {
      name: "Paul Mbuyi",
      phone: "+243 555 123 456",
      email: "events@lefleuve.cd",
    },
    amenities: ["Terrasse", "Cuisine", "Bar", "Parking", "Vue sur fleuve"],
    description: "Restaurant avec terrasse offrant une vue magnifique sur le fleuve Congo",
    status: "available",
    isStarred: true,
    image: "/restaurant-terrace-river-view.png",
  },
]

const typeColors = {
  hotel: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  conference: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  restaurant: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  outdoor: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
}

const typeLabels = {
  hotel: "Hôtel",
  conference: "Centre de conférence",
  restaurant: "Restaurant",
  outdoor: "Extérieur",
  other: "Autre",
}

const statusColors = {
  available: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  booked: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  maintenance: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
}

const statusLabels = {
  available: "Disponible",
  booked: "Réservé",
  maintenance: "Maintenance",
}

export default function VenuesPage() {
  const [filter, setFilter] = useState<string>("all")
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [visibleVenues, setVisibleVenues] = useState<Venue[]>(mockVenues)

  const filterVenues = (filterType: string, query: string) => {
    let filtered = [...mockVenues]

    if (filterType !== "all") {
      filtered = filtered.filter((venue) => venue.status === filterType)
    }

    if (query) {
      const lowercaseQuery = query.toLowerCase()
      filtered = filtered.filter(
        (venue) =>
          venue.name.toLowerCase().includes(lowercaseQuery) ||
          venue.address.toLowerCase().includes(lowercaseQuery) ||
          venue.city.toLowerCase().includes(lowercaseQuery) ||
          venue.description.toLowerCase().includes(lowercaseQuery),
      )
    }

    setVisibleVenues(filtered)
  }

  const handleFilterChange = (filterType: string) => {
    setFilter(filterType)
    filterVenues(filterType, searchQuery)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterVenues(filter, query)
  }

  const toggleStar = (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const updatedVenues = mockVenues.map((venue) =>
      venue.id === id ? { ...venue, isStarred: !venue.isStarred } : venue,
    )
    mockVenues.splice(0, mockVenues.length, ...updatedVenues)
    filterVenues(filter, searchQuery)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-medium">Lieux</h1>
          <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-normal">
            {visibleVenues.length} lieu{visibleVenues.length > 1 ? "x" : ""}
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
                  filterVenues(filter, "")
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
            Ajouter lieu
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
          variant={filter === "available" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange("available")}
        >
          Disponibles
        </Button>
        <Button
          variant={filter === "booked" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange("booked")}
        >
          Réservés
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Venues list */}
        <div className={cn("w-full md:w-2/5 overflow-y-auto p-6", selectedVenue ? "hidden md:block" : "block")}>
          <AnimatePresence>
            {visibleVenues.length > 0 ? (
              visibleVenues.map((venue) => (
                <motion.div
                  key={venue.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                  transition={{ duration: 0.2 }}
                  className={cn(
                    "mb-4 p-4 rounded-xl cursor-pointer transition-all bg-card hover:bg-muted/50",
                    selectedVenue?.id === venue.id ? "ring-2 ring-primary/20" : "hover:shadow-sm",
                  )}
                  onClick={() => setSelectedVenue(venue)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <div className="font-medium">{venue.name}</div>
                        <div className="text-xs text-muted-foreground">{venue.city}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={cn("text-xs", statusColors[venue.status])}>{statusLabels[venue.status]}</Badge>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={(e) => toggleStar(venue.id, e)}>
                        <Star className={cn("h-4 w-4", venue.isStarred ? "fill-amber-400 text-amber-400" : "")} />
                      </Button>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{venue.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {venue.capacity} pers.
                      </div>
                      <Badge className={cn("text-xs", typeColors[venue.type])}>{typeLabels[venue.type]}</Badge>
                    </div>
                    <div className="text-sm font-medium">${venue.pricePerDay}/jour</div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 p-4 text-center"
              >
                <div className="bg-muted/50 p-4 rounded-full mb-4">
                  <MapPin className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Aucun lieu</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Aucun lieu ne correspond à votre recherche" : "Ajoutez votre premier lieu"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Venue detail */}
        <AnimatePresence>
          {selectedVenue ? (
            <motion.div
              className="flex-1 bg-background md:border-l overflow-y-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="sticky top-0 bg-background z-10 p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedVenue(null)}>
                    <X className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={(e) => toggleStar(selectedVenue.id, e)}>
                      <Star className={cn("h-4 w-4", selectedVenue.isStarred ? "fill-amber-400 text-amber-400" : "")} />
                    </Button>
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
                          <Calendar className="h-4 w-4 mr-2" />
                          Réserver
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <h2 className="text-2xl font-medium mb-2">{selectedVenue.name}</h2>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className={cn(statusColors[selectedVenue.status])}>{statusLabels[selectedVenue.status]}</Badge>
                  <Badge className={cn(typeColors[selectedVenue.type])}>{typeLabels[selectedVenue.type]}</Badge>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {selectedVenue.image && (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <img
                      src={selectedVenue.image || "/placeholder.svg"}
                      alt={selectedVenue.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations générales</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{selectedVenue.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Adresse</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedVenue.address}, {selectedVenue.city}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Capacité</div>
                          <div className="text-sm text-muted-foreground">{selectedVenue.capacity} personnes</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Prix</div>
                          <div className="text-sm text-muted-foreground">${selectedVenue.pricePerDay} par jour</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Type</div>
                          <div className="text-sm text-muted-foreground">{typeLabels[selectedVenue.type]}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Responsable</div>
                          <div className="text-sm text-muted-foreground">{selectedVenue.contact.name}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Téléphone</div>
                          <div className="text-sm text-muted-foreground">{selectedVenue.contact.phone}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3 md:col-span-2">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Email</div>
                          <div className="text-sm text-muted-foreground">{selectedVenue.contact.email}</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Équipements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {selectedVenue.amenities.map((amenity, index) => (
                        <Badge key={index} variant="secondary">
                          {amenity}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex space-x-2">
                  <Button>
                    <Calendar className="h-4 w-4 mr-2" />
                    Réserver ce lieu
                  </Button>
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center bg-muted/5">
              <div className="text-center max-w-md p-8">
                <div className="bg-primary/5 p-6 rounded-full inline-block mb-4">
                  <MapPin className="h-10 w-10 text-primary/80" />
                </div>
                <h3 className="text-xl font-medium mb-2">Gestion des lieux</h3>
                <p className="text-muted-foreground mb-6">
                  Sélectionnez un lieu dans la liste pour voir ses détails et le réserver.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un lieu
                </Button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
