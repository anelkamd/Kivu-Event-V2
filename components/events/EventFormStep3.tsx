"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { MapPin, Plus } from "lucide-react"
import axios from "@/lib/axios"

interface EventFormStep3Props {
    eventData: any
    handleChange: (field: string, value: any) => void
}

export default function EventFormStep3({ eventData, handleChange }: EventFormStep3Props) {
    const [venues, setVenues] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showNewVenue, setShowNewVenue] = useState(false)

    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const response = await axios.get("/api/venues")
                if (response.data.success) {
                    setVenues(response.data.data)
                }
            } catch (error) {
                console.error("Error fetching venues:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchVenues()
    }, [])

    const handleVenueSelect = (venueId: string) => {
        const selectedVenue = venues.find((venue) => venue.id === venueId)
        if (selectedVenue) {
            handleChange("venue_id", selectedVenue.id)
            handleChange("venue_name", selectedVenue.name)
            handleChange("venue_address", selectedVenue.address)
        }
    }

    return (
        <div className="space-y-6">
            {!showNewVenue ? (
                <>
                    <div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="venue_id">Lieu de l'événement *</Label>
                            <Button variant="ghost" size="sm" onClick={() => setShowNewVenue(true)}>
                                <Plus className="h-4 w-4 mr-1" /> Nouveau lieu
                            </Button>
                        </div>
                        <Select value={eventData.venue_id} onValueChange={handleVenueSelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez un lieu" />
                            </SelectTrigger>
                            <SelectContent>
                                {loading ? (
                                    <SelectItem value="loading" disabled>
                                        Chargement...
                                    </SelectItem>
                                ) : venues.length > 0 ? (
                                    venues.map((venue) => (
                                        <SelectItem key={venue.id} value={venue.id}>
                                            {venue.name}
                                        </SelectItem>
                                    ))
                                ) : (
                                    <SelectItem value="none" disabled>
                                        Aucun lieu disponible
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {eventData.venue_id && (
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="flex items-start">
                                <MapPin className="h-5 w-5 mr-2 mt-0.5 text-muted-foreground" />
                                <div>
                                    <h3 className="font-medium">{eventData.venue_name}</h3>
                                    <p className="text-sm text-muted-foreground">{eventData.venue_address}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="venue_name">Nouveau lieu</Label>
                            <Button variant="ghost" size="sm" onClick={() => setShowNewVenue(false)}>
                                Annuler
                            </Button>
                        </div>
                        <Input
                            id="venue_name"
                            placeholder="Nom du lieu"
                            value={eventData.venue_name}
                            onChange={(e) => handleChange("venue_name", e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="venue_address">Adresse</Label>
                        <Input
                            id="venue_address"
                            placeholder="Adresse complète"
                            value={eventData.venue_address}
                            onChange={(e) => handleChange("venue_address", e.target.value)}
                        />
                    </div>
                </>
            )}

            <div>
                <Label htmlFor="capacity">Capacité maximale</Label>
                <Input
                    id="capacity"
                    type="number"
                    min="1"
                    placeholder="Nombre de participants"
                    value={eventData.capacity || ""}
                    onChange={(e) => handleChange("capacity", Number(e.target.value))}
                />
            </div>
        </div>
    )
}
