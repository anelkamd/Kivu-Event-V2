"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Event } from "@/types/event"
import axios from "@/lib/axios"

interface RegistrationFormProps {
    event: Event;
    userId: string;
    onClose?: () => void;
}

export function RegistrationForm({ event, userId, onClose }: RegistrationFormProps) {
    const router = useRouter()
    const { toast } = useToast()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        company: "",
        job_title: "",
        dietary_restrictions: "",
        special_requirements: "",
        agreeToTerms: false
    })

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            setIsSubmitting(true)

            if (!formData.agreeToTerms) {
                toast({
                    title: "Conditions non acceptées",
                    description: "Vous devez accepter les conditions pour vous inscrire",
                    variant: "destructive"
                })
                return
            }

            const registrationData = {
                user_id: userId,
                company: formData.company,
                job_title: formData.job_title,
                dietary_restrictions: formData.dietary_restrictions,
                special_requirements: formData.special_requirements
            }

            const response = await axios.post(`/api/events/${event.id}/participants`, registrationData)

            if (response.data.success) {
                toast({
                    title: "Inscription réussie",
                    description: "Vous êtes maintenant inscrit à cet événement. Un email de confirmation a été envoyé.",
                })

                onClose?.() // Appelle la fermeture si fournie
                router.push(`/events/${event.id}/confirmation?participantId=${response.data.data.id}`)
            }
        } catch (error: any) {
            console.error("Error registering for event:", error)
            toast({
                title: "Erreur d'inscription",
                description: error.response?.data?.error || "Une erreur s'est produite lors de l'inscription.",
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Inscription à l'événement</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="company">Entreprise</Label>
                            <Input
                                id="company"
                                value={formData.company}
                                onChange={(e) => handleChange("company", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label htmlFor="job_title">Fonction</Label>
                            <Input
                                id="job_title"
                                value={formData.job_title}
                                onChange={(e) => handleChange("job_title", e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="dietary_restrictions">Restrictions alimentaires</Label>
                        <Input
                            id="dietary_restrictions"
                            placeholder="Végétarien, sans gluten, etc."
                            value={formData.dietary_restrictions}
                            onChange={(e) => handleChange("dietary_restrictions", e.target.value)}
                        />
                    </div>

                    <div>
                        <Label htmlFor="special_requirements">Besoins spécifiques</Label>
                        <Textarea
                            id="special_requirements"
                            placeholder="Accessibilité, équipement spécial, etc."
                            value={formData.special_requirements}
                            onChange={(e) => handleChange("special_requirements", e.target.value)}
                        />
                    </div>

                    <div className="flex items-start space-x-2">
                        <Checkbox
                            id="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onCheckedChange={(checked) => handleChange("agreeToTerms", checked)}
                            required
                        />
                        <div className="grid gap-1.5 leading-none">
                            <Label
                                htmlFor="agreeToTerms"
                                className="text-sm font-medium leading-none"
                            >
                                J'accepte les conditions d'utilisation et la politique de confidentialité *
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                En vous inscrivant, vous acceptez de recevoir des communications concernant cet événement.
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-between gap-4 flex-col md:flex-row">
                    <Button
                        type="submit"
                        className="w-full md:w-auto bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
                    </Button>
                    {onClose && (
                        <Button
                            type="button"
                            variant="ghost"
                            className="w-full md:w-auto"
                            onClick={onClose}
                        >
                            Annuler
                        </Button>
                    )}
                </CardFooter>
            </form>
        </Card>
    )
}
