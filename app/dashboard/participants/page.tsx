"use client"

import React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Mail,
  Phone,
  Building,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  X,
  Star,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Participant {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  eventTitle: string
  registrationDate: string
  status: "registered" | "confirmed" | "attended" | "cancelled"
  avatar?: string
  dietaryRestrictions?: string
  specialRequirements?: string
  isStarred: boolean
}

const mockParticipants: Participant[] = [
  {
    id: "1",
    firstName: "Jean",
    lastName: "Mukendi",
    email: "jean.mukendi@email.com",
    phone: "+243 123 456 789",
    company: "Tech Solutions",
    jobTitle: "Développeur Senior",
    eventTitle: "Conférence Tech Kivu 2024",
    registrationDate: "2024-02-15",
    status: "confirmed",
    avatar: "/placeholder.svg?height=40&width=40",
    dietaryRestrictions: "Végétarien",
    isStarred: true,
  },
  {
    id: "2",
    firstName: "Marie",
    lastName: "Kabila",
    email: "marie.kabila@email.com",
    phone: "+243 987 654 321",
    company: "StartUp Hub",
    jobTitle: "Product Manager",
    eventTitle: "Workshop Développement Web",
    registrationDate: "2024-02-20",
    status: "registered",
    avatar: "/placeholder.svg?height=40&width=40",
    specialRequirements: "Accès PMR",
    isStarred: false,
  },
  {
    id: "3",
    firstName: "Paul",
    lastName: "Tshisekedi",
    email: "paul.tshisekedi@email.com",
    company: "Business Corp",
    jobTitle: "CEO",
    eventTitle: "Networking Business",
    registrationDate: "2024-02-25",
    status: "attended",
    avatar: "/placeholder.svg?height=40&width=40",
    isStarred: true,
  },
]

const statusColors = {
  registered: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  attended: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const statusLabels = {
  registered: "Inscrit",
  confirmed: "Confirmé",
  attended: "Présent",
  cancelled: "Annulé",
}

const statusIcons = {
  registered: Clock,
  confirmed: CheckCircle,
  attended: CheckCircle,
  cancelled: XCircle,
}

export default function ParticipantsPage() {
  const [filter, setFilter] = useState<string>("all")
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [visibleParticipants, setVisibleParticipants] = useState<Participant[]>(mockParticipants)

  const filterParticipants = (filterType: string, query: string) => {
    let filtered = [...mockParticipants]

    if (filterType !== "all") {
      filtered = filtered.filter((participant) => participant.status === filterType)
    }

    if (query) {
      const lowercaseQuery = query.toLowerCase()
      filtered = filtered.filter(
        (participant) =>
          participant.firstName.toLowerCase().includes(lowercaseQuery) ||
          participant.lastName.toLowerCase().includes(lowercaseQuery) ||
          participant.email.toLowerCase().includes(lowercaseQuery) ||
          participant.company?.toLowerCase().includes(lowercaseQuery) ||
          participant.eventTitle.toLowerCase().includes(lowercaseQuery),
      )
    }

    setVisibleParticipants(filtered)
  }

  const handleFilterChange = (filterType: string) => {
    setFilter(filterType)
    filterParticipants(filterType, searchQuery)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterParticipants(filter, query)
  }

  const toggleStar = (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const updatedParticipants = mockParticipants.map((participant) =>
      participant.id === id ? { ...participant, isStarred: !participant.isStarred } : participant,
    )
    mockParticipants.splice(0, mockParticipants.length, ...updatedParticipants)
    filterParticipants(filter, searchQuery)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-medium">Participants</h1>
          <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-normal">
            {visibleParticipants.length} participant{visibleParticipants.length > 1 ? "s" : ""}
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
                  filterParticipants(filter, "")
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
            Ajouter participant
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
          variant={filter === "confirmed" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange("confirmed")}
        >
          Confirmés
        </Button>
        <Button
          variant={filter === "registered" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange("registered")}
        >
          Inscrits
        </Button>
        <Button
          variant={filter === "attended" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange("attended")}
        >
          Présents
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Participants list */}
        <div className={cn("w-full md:w-2/5 overflow-y-auto p-6", selectedParticipant ? "hidden md:block" : "block")}>
          <AnimatePresence>
            {visibleParticipants.length > 0 ? (
              visibleParticipants.map((participant) => {
                const StatusIcon = statusIcons[participant.status]
                return (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "mb-4 p-4 rounded-xl cursor-pointer transition-all bg-card hover:bg-muted/50",
                      selectedParticipant?.id === participant.id ? "ring-2 ring-primary/20" : "hover:shadow-sm",
                    )}
                    onClick={() => setSelectedParticipant(participant)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={participant.avatar || "/placeholder.svg"}
                            alt={`${participant.firstName} ${participant.lastName}`}
                          />
                          <AvatarFallback>
                            {participant.firstName.charAt(0)}
                            {participant.lastName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {participant.firstName} {participant.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {participant.company} • {participant.jobTitle}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={cn("text-xs flex items-center gap-1", statusColors[participant.status])}>
                          <StatusIcon className="h-3 w-3" />
                          {statusLabels[participant.status]}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => toggleStar(participant.id, e)}
                        >
                          <Star
                            className={cn("h-4 w-4", participant.isStarred ? "fill-amber-400 text-amber-400" : "")}
                          />
                        </Button>
                      </div>
                    </div>

                    <h3 className="font-medium mb-1">{participant.eventTitle}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{participant.email}</p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        Inscrit le {new Date(participant.registrationDate).toLocaleDateString("fr-FR")}
                      </div>
                      {participant.phone && (
                        <div className="flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {participant.phone}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-64 p-4 text-center"
              >
                <div className="bg-muted/50 p-4 rounded-full mb-4">
                  <Users className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Aucun participant</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery ? "Aucun participant ne correspond à votre recherche" : "Aucun participant inscrit"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Participant detail */}
        <AnimatePresence>
          {selectedParticipant ? (
            <motion.div
              className="flex-1 bg-background md:border-l overflow-y-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="sticky top-0 bg-background z-10 p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedParticipant(null)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={(e) => toggleStar(selectedParticipant.id, e)}>
                      <Star
                        className={cn("h-4 w-4", selectedParticipant.isStarred ? "fill-amber-400 text-amber-400" : "")}
                      />
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
                          <Mail className="h-4 w-4 mr-2" />
                          Envoyer email
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                <div className="flex items-center space-x-4 mb-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage
                      src={selectedParticipant.avatar || "/placeholder.svg"}
                      alt={`${selectedParticipant.firstName} ${selectedParticipant.lastName}`}
                    />
                    <AvatarFallback className="text-lg">
                      {selectedParticipant.firstName.charAt(0)}
                      {selectedParticipant.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-medium">
                      {selectedParticipant.firstName} {selectedParticipant.lastName}
                    </h2>
                    <p className="text-muted-foreground">
                      {selectedParticipant.company} • {selectedParticipant.jobTitle}
                    </p>
                  </div>
                </div>

                <Badge className={cn("flex items-center gap-1 w-fit", statusColors[selectedParticipant.status])}>
                  {React.createElement(statusIcons[selectedParticipant.status], { className: "h-3 w-3" })}
                  {statusLabels[selectedParticipant.status]}
                </Badge>
              </div>

              <div className="p-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informations de contact</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Email</div>
                          <div className="text-sm text-muted-foreground">{selectedParticipant.email}</div>
                        </div>
                      </div>

                      {selectedParticipant.phone && (
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Téléphone</div>
                            <div className="text-sm text-muted-foreground">{selectedParticipant.phone}</div>
                          </div>
                        </div>
                      )}

                      {selectedParticipant.company && (
                        <div className="flex items-center space-x-3">
                          <Building className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Entreprise</div>
                            <div className="text-sm text-muted-foreground">{selectedParticipant.company}</div>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Date d'inscription</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(selectedParticipant.registrationDate).toLocaleDateString("fr-FR")}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Événement</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-medium">{selectedParticipant.eventTitle}</h3>
                  </CardContent>
                </Card>

                {(selectedParticipant.dietaryRestrictions || selectedParticipant.specialRequirements) && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Besoins spéciaux</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedParticipant.dietaryRestrictions && (
                        <div>
                          <div className="font-medium mb-1">Restrictions alimentaires</div>
                          <div className="text-sm text-muted-foreground">{selectedParticipant.dietaryRestrictions}</div>
                        </div>
                      )}
                      {selectedParticipant.specialRequirements && (
                        <div>
                          <div className="font-medium mb-1">Exigences spéciales</div>
                          <div className="text-sm text-muted-foreground">{selectedParticipant.specialRequirements}</div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <div className="flex space-x-2">
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button variant="outline">
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer email
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center bg-muted/5">
              <div className="text-center max-w-md p-8">
                <div className="bg-primary/5 p-6 rounded-full inline-block mb-4">
                  <Users className="h-10 w-10 text-primary/80" />
                </div>
                <h3 className="text-xl font-medium mb-2">Gestion des participants</h3>
                <p className="text-muted-foreground mb-6">
                  Sélectionnez un participant dans la liste pour voir ses détails et le contacter.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un participant
                </Button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
