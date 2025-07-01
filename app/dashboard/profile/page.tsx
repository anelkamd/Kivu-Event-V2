"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import LoadingSpinner from "@/components/ui/LoadingSpinner"
import {
  User,
  Calendar,
  Users,
  MapPin,
  Clock,
  Edit3,
  Save,
  X,
  Camera,
  Mail,
  Phone,
  Building,
  Briefcase,
  AlertCircle,
  RefreshCw,
} from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import axios from "@/lib/axios"
import { toast } from "sonner"

interface UserProfile {
  id: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  company?: string
  job_title?: string
  profile_image?: string
  role?: string
  created_at: string
}

interface Event {
  id: string
  title: string
  description: string
  type: "conference" | "seminar" | "workshop" | "meeting"
  start_date: string
  end_date: string
  capacity: number
  status: "draft" | "published" | "cancelled" | "completed"
  image?: string
  price: number
  participants_count: number
  organizer?: {
    name: string
    profile_image?: string
  }
  venue?: {
    name: string
    address: string
    city: string
  }
  registration_date?: string
}

const typeColors = {
  conference: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  seminar: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  workshop: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  meeting: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
}

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  published: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  completed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [myEvents, setMyEvents] = useState<Event[]>([])
  const [myParticipations, setMyParticipations] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editedUser, setEditedUser] = useState<Partial<UserProfile>>({})
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    fetchUserData()
  }, [])

  const fetchDebugInfo = async () => {
    try {
      const response = await axios.get("/api/debug/user")
      setDebugInfo(response.data)
      console.log("Informations de debug:", response.data)
    } catch (error) {
      console.error("Erreur lors de la récupération des infos de debug:", error)
    }
  }

  const testAuthEndpoint = async () => {
    try {
      console.log("Test de l'endpoint /api/auth/me...")
      const response = await axios.get("/api/auth/me")
      console.log("Réponse /api/auth/me:", response.data)
      toast.success("Authentification vérifiée avec succès")
    } catch (error) {
      console.error("Erreur /api/auth/me:", error)
      toast.error("Erreur lors de la vérification de l'authentification")
    }
  }

  const fetchUserData = async () => {
    try {
      setLoading(true)
      console.log("=== Début du chargement des données utilisateur ===")

      // Vérifier le token dans localStorage
      const token = localStorage.getItem("token")
      console.log("Token dans localStorage:", token ? "présent" : "absent")

      if (!token) {
        console.log("Aucun token trouvé, redirection vers login")
        window.location.href = "/login"
        return
      }

      // Test de l'endpoint d'authentification d'abord
      try {
        console.log("Test de l'authentification...")
        const authResponse = await axios.get("/api/auth/me")
        console.log("Authentification réussie:", authResponse.data)
      } catch (authError) {
        console.error("Erreur d'authentification:", authError)
        toast.error("Session expirée, veuillez vous reconnecter")
        localStorage.removeItem("token")
        window.location.href = "/login"
        return
      }

      // Récupérer les informations utilisateur
      try {
        console.log("Récupération des informations utilisateur...")
        const userResponse = await axios.get("/api/users/me")
        console.log("Réponse utilisateur:", userResponse.data)

        if (userResponse.data.success) {
          setUser(userResponse.data.data)
          setEditedUser(userResponse.data.data)
          console.log("Données utilisateur chargées avec succès")
        } else {
          console.error("Erreur dans la réponse utilisateur:", userResponse.data.message)
          toast.error("Erreur lors du chargement du profil")
        }
      } catch (userError) {
        console.error("Erreur lors de la récupération de l'utilisateur:", userError)
        toast.error("Impossible de charger les informations du profil")

        // Récupérer les informations de debug
        await fetchDebugInfo()
      }

      // Récupérer les événements créés (optionnel)
      try {
        console.log("Récupération des événements créés...")
        const eventsResponse = await axios.get("/api/events/my-events?limit=50")
        console.log("Réponse événements créés:", eventsResponse.data)

        if (eventsResponse.data.success) {
          setMyEvents(eventsResponse.data.data || [])
          console.log("Événements créés chargés:", eventsResponse.data.data?.length || 0)
        }
      } catch (eventsError) {
        console.error("Erreur lors de la récupération des événements:", eventsError)
        setMyEvents([])
      }

      // Récupérer les participations (optionnel)
      try {
        console.log("Récupération des participations...")
        const participationsResponse = await axios.get("/api/events/my-participations?limit=50")
        console.log("Réponse participations:", participationsResponse.data)

        if (participationsResponse.data.success) {
          setMyParticipations(participationsResponse.data.data || [])
          console.log("Participations chargées:", participationsResponse.data.data?.length || 0)
        }
      } catch (participationsError) {
        console.error("Erreur lors de la récupération des participations:", participationsError)
        setMyParticipations([])
      }
    } catch (error) {
      console.error("Erreur générale lors du chargement des données:", error)
      toast.error("Erreur lors du chargement des données")
    } finally {
      setLoading(false)
      console.log("=== Fin du chargement des données ===")
    }
  }

  const handleSaveProfile = async () => {
    try {
      console.log("Sauvegarde du profil:", editedUser)
      const response = await axios.put("/api/users/me", editedUser)

      if (response.data.success) {
        setUser(response.data.data)
        setEditMode(false)
        toast.success("Profil mis à jour avec succès")
      } else {
        toast.error(response.data.message || "Erreur lors de la mise à jour")
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error)
      toast.error("Erreur lors de la mise à jour du profil")
    }
  }

  const handleCancelEdit = () => {
    setEditedUser(user || {})
    setEditMode(false)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName?.charAt(0) || ""}${lastName?.charAt(0) || ""}`.toUpperCase()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Erreur de chargement du profil
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Impossible de charger les informations du profil. Cela peut être dû à :
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm text-muted-foreground">
              <li>Session expirée</li>
              <li>Problème de connexion à la base de données</li>
              <li>Token d'authentification invalide</li>
            </ul>

            <div className="flex gap-2">
              <Button onClick={fetchUserData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
              <Button variant="outline" onClick={testAuthEndpoint}>
                Tester l'authentification
              </Button>
              <Button variant="outline" onClick={fetchDebugInfo}>
                Informations de debug
              </Button>
            </div>

            {debugInfo && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Informations de debug :</h4>
                <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Mon Profil</h1>
        {!editMode && (
          <Button onClick={() => setEditMode(true)} variant="outline">
            <Edit3 className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        )}
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="my-events">Mes Événements ({myEvents.length})</TabsTrigger>
          <TabsTrigger value="participations">Mes Participations ({myParticipations.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo de profil */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={user.profile_image || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-semibold">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-muted-foreground">{user.email}</p>
                  {user.role && (
                    <Badge variant="secondary" className="mt-1">
                      {user.role}
                    </Badge>
                  )}
                  <Button variant="outline" size="sm" className="mt-2 bg-transparent">
                    <Camera className="h-4 w-4 mr-2" />
                    Changer la photo
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Formulaire d'édition */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">Prénom</Label>
                  {editMode ? (
                    <Input
                      id="first_name"
                      value={editedUser.first_name || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, first_name: e.target.value })}
                    />
                  ) : (
                    <p className="p-2 bg-muted rounded">{user.first_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="last_name">Nom</Label>
                  {editMode ? (
                    <Input
                      id="last_name"
                      value={editedUser.last_name || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, last_name: e.target.value })}
                    />
                  ) : (
                    <p className="p-2 bg-muted rounded">{user.last_name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    Email
                  </Label>
                  {editMode ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedUser.email || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                    />
                  ) : (
                    <p className="p-2 bg-muted rounded">{user.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Téléphone
                  </Label>
                  {editMode ? (
                    <Input
                      id="phone"
                      value={editedUser.phone || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, phone: e.target.value })}
                      placeholder="Numéro de téléphone"
                    />
                  ) : (
                    <p className="p-2 bg-muted rounded">{user.phone || "Non renseigné"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Entreprise
                  </Label>
                  {editMode ? (
                    <Input
                      id="company"
                      value={editedUser.company || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, company: e.target.value })}
                      placeholder="Nom de l'entreprise"
                    />
                  ) : (
                    <p className="p-2 bg-muted rounded">{user.company || "Non renseigné"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="job_title" className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Poste
                  </Label>
                  {editMode ? (
                    <Input
                      id="job_title"
                      value={editedUser.job_title || ""}
                      onChange={(e) => setEditedUser({ ...editedUser, job_title: e.target.value })}
                      placeholder="Intitulé du poste"
                    />
                  ) : (
                    <p className="p-2 bg-muted rounded">{user.job_title || "Non renseigné"}</p>
                  )}
                </div>
              </div>

              {editMode && (
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleSaveProfile}>
                    <Save className="h-4 w-4 mr-2" />
                    Sauvegarder
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-2" />
                    Annuler
                  </Button>
                </div>
              )}

              <Separator />

              <div className="text-sm text-muted-foreground">
                <p>Membre depuis le {format(new Date(user.created_at), "dd MMMM yyyy", { locale: fr })}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="my-events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Événements que j'ai créés
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Vous n'avez créé aucun événement</p>
                  <Button className="mt-4" onClick={() => (window.location.href = "/dashboard/events/create")}>
                    Créer mon premier événement
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myEvents.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{event.title}</h3>
                              <Badge className={typeColors[event.type]}>{event.type}</Badge>
                              <Badge className={statusColors[event.status]}>{event.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(new Date(event.start_date), "dd/MM/yyyy HH:mm")}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {event.participants_count}/{event.capacity}
                              </div>
                              {event.venue && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {event.venue.name}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => (window.location.href = `/dashboard/events/${event.id}`)}
                          >
                            Voir détails
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="participations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Événements auxquels je participe
              </CardTitle>
            </CardHeader>
            <CardContent>
              {myParticipations.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Vous ne participez à aucun événement</p>
                  <Button className="mt-4" onClick={() => (window.location.href = "/events")}>
                    Découvrir les événements
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myParticipations.map((event) => (
                    <Card key={event.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{event.title}</h3>
                              <Badge className={typeColors[event.type]}>{event.type}</Badge>
                              <Badge className={statusColors[event.status]}>{event.status}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {format(new Date(event.start_date), "dd/MM/yyyy HH:mm")}
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {event.participants_count}/{event.capacity}
                              </div>
                              {event.venue && (
                                <div className="flex items-center gap-1">
                                  <MapPin className="h-4 w-4" />
                                  {event.venue.name}
                                </div>
                              )}
                              {event.organizer && <div className="text-xs">Organisé par {event.organizer.name}</div>}
                            </div>
                            {event.registration_date && (
                              <div className="text-xs text-muted-foreground mt-1">
                                Inscrit le {format(new Date(event.registration_date), "dd/MM/yyyy")}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => (window.location.href = `/events/details/${event.id}`)}
                          >
                            Voir détails
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
