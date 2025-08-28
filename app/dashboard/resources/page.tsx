"use client"

import React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Package,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  DollarSign,
  Building,
  Phone,
  Star,
  X,
  Truck,
  Users,
  Wrench,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Resource {
  id: string
  name: string
  description: string
  type: "salle" | "materiel" | "budget" | "personnel" | "transport" | "autre"
  quantity: number
  unit: string
  costPerUnit: number
  supplier?: string
  contactInfo?: string
  bookingReference?: string
  status: "disponible" | "reserve" | "utilise" | "indisponible"
  eventTitle: string
  notes?: string
  isStarred: boolean
}

const mockResources: Resource[] = [
  {
    id: "1",
    name: "Projecteur HD",
    description: "Projecteur haute définition pour présentations",
    type: "materiel",
    quantity: 2,
    unit: "unité",
    costPerUnit: 150,
    supplier: "TechRent Congo",
    contactInfo: "contact@techrent.cd - +243 123 456 789",
    bookingReference: "TR-2024-001",
    status: "reserve",
    eventTitle: "Conférence Tech Kivu 2024",
    notes: "Inclut câbles HDMI et télécommande",
    isStarred: true,
  },
  {
    id: "2",
    name: "Système de sonorisation",
    description: "Système audio complet avec micros sans fil",
    type: "materiel",
    quantity: 1,
    unit: "ensemble",
    costPerUnit: 300,
    supplier: "Audio Pro",
    contactInfo: "info@audiopro.cd - +243 987 654 321",
    status: "disponible",
    eventTitle: "Workshop Développement Web",
    notes: "4 micros sans fil inclus",
    isStarred: false,
  },
  {
    id: "3",
    name: "Service traiteur",
    description: "Repas et collations pour participants",
    type: "autre",
    quantity: 100,
    unit: "personne",
    costPerUnit: 25,
    supplier: "Délices du Congo",
    contactInfo: "commandes@delices.cd - +243 555 123 456",
    bookingReference: "DC-2024-015",
    status: "utilise",
    eventTitle: "Networking Business",
    notes: "Menu végétarien disponible",
    isStarred: true,
  },
  {
    id: "4",
    name: "Transport participants",
    description: "Bus pour transport des participants",
    type: "transport",
    quantity: 2,
    unit: "bus",
    costPerUnit: 200,
    supplier: "Transport Express",
    contactInfo: "booking@transport-express.cd",
    status: "disponible",
    eventTitle: "Conférence Tech Kivu 2024",
    isStarred: false,
  },
]

const typeColors = {
  salle: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  materiel: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  budget: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  personnel: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  transport: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300",
  autre: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
}

const typeLabels = {
  salle: "Salle",
  materiel: "Matériel",
  budget: "Budget",
  personnel: "Personnel",
  transport: "Transport",
  autre: "Autre",
}

const typeIcons = {
  salle: Building,
  materiel: Wrench,
  budget: DollarSign,
  personnel: Users,
  transport: Truck,
  autre: Package,
}

const statusColors = {
  disponible: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  reserve: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  utilise: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  indisponible: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const statusLabels = {
  disponible: "Disponible",
  reserve: "Réservé",
  utilise: "Utilisé",
  indisponible: "Indisponible",
}

export default function ResourcesPage() {
  const [filter, setFilter] = useState<string>("all")
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [visibleResources, setVisibleResources] = useState<Resource[]>(mockResources)

  const filterResources = (filterType: string, query: string) => {
    let filtered = [...mockResources]

    if (filterType !== "all") {
      filtered = filtered.filter((resource) => resource.status === filterType)
    }

    if (query) {
      const lowercaseQuery = query.toLowerCase()
      filtered = filtered.filter(
        (resource) =>
          resource.name.toLowerCase().includes(lowercaseQuery) ||
          resource.description.toLowerCase().includes(lowercaseQuery) ||
          resource.supplier?.toLowerCase().includes(lowercaseQuery) ||
          resource.eventTitle.toLowerCase().includes(lowercaseQuery),
      )
    }

    setVisibleResources(filtered)
  }

  const handleFilterChange = (filterType: string) => {
    setFilter(filterType)
    filterResources(filterType, searchQuery)
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    filterResources(filter, query)
  }

  const toggleStar = (id: string, event: React.MouseEvent) => {
    event.stopPropagation()
    const updatedResources = mockResources.map((resource) =>
      resource.id === id ? { ...resource, isStarred: !resource.isStarred } : resource,
    )
    mockResources.splice(0, mockResources.length, ...updatedResources)
    filterResources(filter, searchQuery)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-6 flex items-center justify-between border-b">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-medium">Ressources</h1>
          <Badge variant="outline" className="rounded-full px-3 py-0.5 text-xs font-normal">
            {visibleResources.length} ressource{visibleResources.length > 1 ? "s" : ""}
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
                  filterResources(filter, "")
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
            Ajouter ressource
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
          Toutes
        </Button>
        <Button
          variant={filter === "disponible" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange("disponible")}
        >
          Disponibles
        </Button>
        <Button
          variant={filter === "reserve" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange("reserve")}
        >
          Réservées
        </Button>
        <Button
          variant={filter === "utilise" ? "default" : "outline"}
          size="sm"
          className="rounded-full"
          onClick={() => handleFilterChange("utilise")}
        >
          Utilisées
        </Button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Resources list */}
        <div className={cn("w-full md:w-2/5 overflow-y-auto p-6", selectedResource ? "hidden md:block" : "block")}>
          <AnimatePresence>
            {visibleResources.length > 0 ? (
              visibleResources.map((resource) => {
                const TypeIcon = typeIcons[resource.type]
                const totalCost = resource.quantity * resource.costPerUnit

                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, overflow: "hidden" }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      "mb-4 p-4 rounded-xl cursor-pointer transition-all bg-card hover:bg-muted/50",
                      selectedResource?.id === resource.id ? "ring-2 ring-primary/20" : "hover:shadow-sm",
                    )}
                    onClick={() => setSelectedResource(resource)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                          <TypeIcon className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{resource.name}</div>
                          <div className="text-xs text-muted-foreground">{resource.supplier}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={cn("text-xs", statusColors[resource.status])}>
                          {statusLabels[resource.status]}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={(e) => toggleStar(resource.id, e)}
                        >
                          <Star className={cn("h-4 w-4", resource.isStarred ? "fill-amber-400 text-amber-400" : "")} />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{resource.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <Package className="h-3 w-3 mr-1" />
                          {resource.quantity} {resource.unit}
                        </div>
                        <Badge className={cn("text-xs", typeColors[resource.type])}>{typeLabels[resource.type]}</Badge>
                      </div>
                      <div className="text-sm font-medium">${totalCost}</div>
                    </div>

                    <div className="mt-2 text-xs text-muted-foreground">{resource.eventTitle}</div>
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
                  <Package className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium mb-1">Aucune ressource</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery
                    ? "Aucune ressource ne correspond à votre recherche"
                    : "Ajoutez votre première ressource"}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Resource detail */}
        <AnimatePresence>
          {selectedResource ? (
            <motion.div
              className="flex-1 bg-background md:border-l overflow-y-auto"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <div className="sticky top-0 bg-background z-10 p-6 border-b">
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSelectedResource(null)}>
                    <X className="h-5 w-5" />
                  </Button>
                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon" onClick={(e) => toggleStar(selectedResource.id, e)}>
                      <Star
                        className={cn("h-4 w-4", selectedResource.isStarred ? "fill-amber-400 text-amber-400" : "")}
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
                          <Package className="h-4 w-4 mr-2" />
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

                <h2 className="text-2xl font-medium mb-2">{selectedResource.name}</h2>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge className={cn(statusColors[selectedResource.status])}>
                    {statusLabels[selectedResource.status]}
                  </Badge>
                  <Badge className={cn(typeColors[selectedResource.type])}>
                    {React.createElement(typeIcons[selectedResource.type], { className: "h-3 w-3 mr-1" })}
                    {typeLabels[selectedResource.type]}
                  </Badge>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{selectedResource.description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Détails de la ressource</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Quantité</div>
                          <div className="text-sm text-muted-foreground">
                            {selectedResource.quantity} {selectedResource.unit}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Coût unitaire</div>
                          <div className="text-sm text-muted-foreground">${selectedResource.costPerUnit}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Coût total</div>
                          <div className="text-sm text-muted-foreground font-medium">
                            ${selectedResource.quantity * selectedResource.costPerUnit}
                          </div>
                        </div>
                      </div>

                      {selectedResource.bookingReference && (
                        <div className="flex items-center space-x-3">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Référence</div>
                            <div className="text-sm text-muted-foreground">{selectedResource.bookingReference}</div>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {selectedResource.supplier && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Fournisseur</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Nom</div>
                          <div className="text-sm text-muted-foreground">{selectedResource.supplier}</div>
                        </div>
                      </div>

                      {selectedResource.contactInfo && (
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">Contact</div>
                            <div className="text-sm text-muted-foreground">{selectedResource.contactInfo}</div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Événement associé</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-medium">{selectedResource.eventTitle}</h3>
                  </CardContent>
                </Card>

                {selectedResource.notes && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{selectedResource.notes}</p>
                    </CardContent>
                  </Card>
                )}

                <div className="flex space-x-2">
                  <Button>
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button variant="outline">
                    <Package className="h-4 w-4 mr-2" />
                    Réserver
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center bg-muted/5">
              <div className="text-center max-w-md p-8">
                <div className="bg-primary/5 p-6 rounded-full inline-block mb-4">
                  <Package className="h-10 w-10 text-primary/80" />
                </div>
                <h3 className="text-xl font-medium mb-2">Gestion des ressources</h3>
                <p className="text-muted-foreground mb-6">
                  Sélectionnez une ressource dans la liste pour voir ses détails et la gérer.
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter une ressource
                </Button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
