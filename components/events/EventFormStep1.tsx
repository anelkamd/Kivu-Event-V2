"use client"

import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface EventFormStep1Props {
    eventData: any
    handleChange: (field: string, value: any) => void
}

export default function EventFormStep1({ eventData, handleChange }: EventFormStep1Props) {
    return (
        <div className="space-y-4">
            <div>
                <Label htmlFor="title">Titre de l'événement *</Label>
                <Input
                    id="title"
                    placeholder="Ex: Conférence annuelle de technologie"
                    value={eventData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                />
            </div>

            <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                    id="description"
                    placeholder="Décrivez votre événement..."
                    rows={5}
                    value={eventData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                />
            </div>

            <div>
                <Label htmlFor="type">Type d'événement *</Label>
                <Select value={eventData.type} onValueChange={(value) => handleChange("type", value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="conference">Conférence</SelectItem>
                        <SelectItem value="seminar">Séminaire</SelectItem>
                        <SelectItem value="workshop">Atelier</SelectItem>
                        <SelectItem value="meeting">Réunion</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <Label htmlFor="tags">Tags (séparés par des virgules)</Label>
                <Input
                    id="tags"
                    placeholder="Ex: tech, innovation, formation"
                    value={eventData.tags}
                    onChange={(e) => handleChange("tags", e.target.value)}
                />
            </div>

            <div>
                <Label htmlFor="price">Prix (0 pour gratuit)</Label>
                <Input
                    id="price"
                    type="number"
                    min="0"
                    placeholder="Prix en €"
                    value={eventData.price}
                    onChange={(e) => handleChange("price", Number(e.target.value))}
                />
            </div>
        </div>
    )
}
