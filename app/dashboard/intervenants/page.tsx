"use client"

import { useState } from "react"
import { Search, Star, MoreHorizontal, Plus, Mail, Phone, Calendar, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Moderator {
  id: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
  specialization?: string
  bio?: string
  profileImage?: string
  isActive: boolean
  role: "moderateur" | "superviseur" | "validateur"
  permissions: {
    canValidateTasks: boolean
    canAssignTasks: boolean
    canManageResources: boolean
    canViewReports: boolean
    canModerateComments: boolean
  }
  assignedEvents: string[]
  lastLogin?: string
  activatedAt?: string
  isStarred: boolean
}

const mockModerators: Moderator[] = [
  {
    id: "1",
    firstName: "Marie",
    lastName: "Lukaku",
    email: "marie.lukaku@kivuevent.app",
    phoneNumber: "+243 123 456 789",
    specialization: "Gestion d'événements",
    bio: "Experte en gestion d'événements avec plus de 5 ans d'expérience dans l'organisation d'événements corporatifs et culturels.",
    isActive: true,
    role: "superviseur",
    permissions: {
      canValidateTasks: true,
      canAssignTasks: true,
      canManageResources: true,
      canViewReports: true,
      canModerateComments: true,
    },
    assignedEvents: ["event-1", "event-2"],
    lastLogin: "2024-01-15T10:30:00Z",
    activatedAt: "2023-06-01T09:00:00Z",
    isStarred: true,
  },
  {
    id: "2",
    firstName: "Jean",
    lastName: "Kabila",
    email: "jean.kabila@kivuevent.app",
    phoneNumber: "+243 987 654 321",
    specialization: "Modération de contenu",
    bio: "Spécialiste en modération de contenu et gestion des commentaires pour les événements en ligne.",
    isActive: true,
    role: "moderateur",
    permissions: {
      canValidateTasks: false,
      canAssignTasks: false,
      canManageResources: false,
      canViewReports: true,
      canModerateComments: true,
    },
    assignedEvents: ["event-3"],
    lastLogin: "2024-01-14T16:45:00Z",
    activatedAt: "2023-08-15T14:30:00Z",
    isStarred: false,
  },
  {
    id: "3",
    firstName: "Grace",
    lastName: "Mbuyi",
    email: "grace.mbuyi@kivuevent.app",
    phoneNumber: "+243 555 123 456",
    specialization: "Validation des tâches",
    bio: "Responsable de la validation des tâches et du contrôle qualité des événements.",
    isActive: false,
    role: "validateur",
    permissions: {
      canValidateTasks: true,
      canAssignTasks: false,
      canManageResources: true,
      canViewReports: true,
      canModerateComments: false,
    },
    assignedEvents: [],
    lastLogin: "2024-01-10T08:20:00Z",
    activatedAt: "2023-09-01T11:00:00Z",
    isStarred: true,
  },
]

export default function ModeratorsPage() {
  const [selectedModerator, setSelectedModerator] = useState<Moderator | null>(mockModerators[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")

  const filteredModerators = mockModerators.filter((moderator) => {
    const matchesSearch =
      `${moderator.firstName} ${moderator.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      moderator.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterRole === "all" || moderator.role === filterRole
    return matchesSearch && matchesFilter
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "superviseur":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      case "moderateur":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "validateur":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  const formatLastLogin = (dateString?: string) => {
    if (!dateString) return "Jamais connecté"
    const date = new Date(dateString)
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex h-full">
      {/* Liste des modérateurs */}
      <div className="w-1/3 border-r border-border bg-background">
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Modérateurs</h1>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouveau
            </Button>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un modérateur..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-input bg-background rounded-md"
            >
              <option value="all">Tous les rôles</option>
              <option value="superviseur">Superviseur</option>
              <option value="moderateur">Modérateur</option>
              <option value="validateur">Validateur</option>
            </select>
          </div>
        </div>

        <div className="overflow-y-auto">
          {filteredModerators.map((moderator) => (
            <div
              key={moderator.id}
              className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedModerator?.id === moderator.id ? "bg-muted" : ""
              }`}
              onClick={() => setSelectedModerator(moderator)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={moderator.profileImage || "/placeholder.svg"} />
                    <AvatarFallback>
                      {moderator.firstName[0]}
                      {moderator.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium truncate">
                        {moderator.firstName} {moderator.lastName}
                      </p>
                      {moderator.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{moderator.email}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge className={`text-xs ${getRoleBadgeColor(moderator.role)}`}>{moderator.role}</Badge>
                      <div className={`h-2 w-2 rounded-full ${moderator.isActive ? "bg-green-500" : "bg-gray-400"}`} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Détails du modérateur */}
      <div className="flex-1 bg-background">
        {selectedModerator ? (
          <div className="h-full overflow-y-auto">
            <div className="p-6 border-b border-border">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={selectedModerator.profileImage || "/placeholder.svg"} />
                    <AvatarFallback className="text-lg">
                      {selectedModerator.firstName[0]}
                      {selectedModerator.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h2 className="text-2xl font-bold">
                        {selectedModerator.firstName} {selectedModerator.lastName}
                      </h2>
                      {selectedModerator.isStarred && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
                    </div>
                    <p className="text-muted-foreground">{selectedModerator.email}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getRoleBadgeColor(selectedModerator.role)}>{selectedModerator.role}</Badge>
                      <Badge variant={selectedModerator.isActive ? "default" : "secondary"}>
                        {selectedModerator.isActive ? "Actif" : "Inactif"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Modifier</DropdownMenuItem>
                    <DropdownMenuItem>Désactiver</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Supprimer</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Informations de contact */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Informations de contact</h3>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedModerator.email}</span>
                  </div>
                  {selectedModerator.phoneNumber && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{selectedModerator.phoneNumber}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Dernière connexion: {formatLastLogin(selectedModerator.lastLogin)}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Spécialisation et bio */}
              {(selectedModerator.specialization || selectedModerator.bio) && (
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Profil professionnel</h3>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {selectedModerator.specialization && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Spécialisation</p>
                        <p className="text-sm">{selectedModerator.specialization}</p>
                      </div>
                    )}
                    {selectedModerator.bio && (
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Biographie</p>
                        <p className="text-sm">{selectedModerator.bio}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Permissions */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Permissions</span>
                  </h3>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          selectedModerator.permissions.canValidateTasks ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      <span className="text-sm">Valider les tâches</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          selectedModerator.permissions.canAssignTasks ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      <span className="text-sm">Assigner les tâches</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          selectedModerator.permissions.canManageResources ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      <span className="text-sm">Gérer les ressources</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          selectedModerator.permissions.canViewReports ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      <span className="text-sm">Voir les rapports</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          selectedModerator.permissions.canModerateComments ? "bg-green-500" : "bg-gray-400"
                        }`}
                      />
                      <span className="text-sm">Modérer les commentaires</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Événements assignés */}
              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Événements assignés</h3>
                </CardHeader>
                <CardContent>
                  {selectedModerator.assignedEvents.length > 0 ? (
                    <div className="space-y-2">
                      {selectedModerator.assignedEvents.map((eventId) => (
                        <Badge key={eventId} variant="outline">
                          Événement {eventId}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun événement assigné</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">Sélectionnez un modérateur pour voir les détails</p>
          </div>
        )}
      </div>
    </div>
  )
}
