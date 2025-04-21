"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, X, Calendar, MapPin, Users, Info } from "lucide-react"
import EventFormStep1 from "@/components/events/EventFormStep1"
import EventFormStep2 from "@/components/events/EventFormStep2"
import EventFormStep3 from "@/components/events/EventFormStep3"
import axios from "@/lib/axios"

export default function CreateEventPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [currentStep, setCurrentStep] = useState(1)
    const [isFormVisible, setIsFormVisible] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [eventData, setEventData] = useState({
        title: "",
        description: "",
        type: "",
        start_date: "",
        end_date: "",
        capacity: 0,
        registration_deadline: "",
        status: "draft",
        price: 0,
        organizer_id: "", // Sera rempli avec l'ID de l'utilisateur connecté
        venue_id: "", // Sera sélectionné dans l'étape 2
        venue_name: "",
        venue_address: "",
        tags: "",
    })

    // Afficher le formulaire avec animation après le chargement de la page
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsFormVisible(true)
        }, 300)
        return () => clearTimeout(timer)
    }, [])

    const handleChange = (field: string, value: any) => {
        setEventData((prev) => ({
            ...prev,
            [field]: value,
        }))
    }

    const nextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1)
        }
    }

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true)

            // Validation des champs requis
            const requiredFields = ["title", "description", "type", "start_date", "end_date", "venue_id"]
            const missingFields = requiredFields.filter((field) => !eventData[field])

            if (missingFields.length > 0) {
                toast({
                    title: "Champs manquants",
                    description: `Veuillez remplir tous les champs obligatoires.`,
                    variant: "destructive",
                })
                setIsSubmitting(false)
                return
            }

            // Préparer les données pour l'envoi
            const dataToSubmit = {
                ...eventData,
            }

            // Envoyer les données à l'API
            const response = await axios.post("/api/events", dataToSubmit)

            if (response.data.success) {
                toast({
                    title: "Événement créé",
                    description: "Votre événement a été créé avec succès.",
                })

                // Rediriger vers la page de détails de l'événement
                router.push(`/events/details/${response.data.data.id}`)
            }
        } catch (error: any) {
            console.error("Error creating event:", error)
            toast({
                title: "Erreur",
                description: error.response?.data?.error || "Une erreur s'est produite lors de la création de l'événement.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const closeForm = () => {
        setIsFormVisible(false)
        // No redirection, just close the form and stay on the current page
    }

    return (
        <div className="container mx-auto py-6 relative min-h-screen">
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Créer un nouvel événement</h1>
                <p className="text-muted-foreground">Remplissez les informations pour créer votre événement</p>
            </div>

            {/* Indicateur d'étapes */}
            <div className="mb-8">
                <div className="flex items-center justify-between max-w-3xl mx-auto">
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                currentStep >= 1 ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-200 dark:bg-gray-700"
                            }`}
                        >
                            <Info className="h-5 w-5" />
                        </div>
                        <span className="text-sm mt-2">Informations</span>
                    </div>
                    <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 mx-2">
                        <div
                            className="h-full bg-black dark:bg-white transition-all duration-300"
                            style={{ width: currentStep >= 2 ? "100%" : "0%" }}
                        ></div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                currentStep >= 2 ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-200 dark:bg-gray-700"
                            }`}
                        >
                            <Calendar className="h-5 w-5" />
                        </div>
                        <span className="text-sm mt-2">Dates</span>
                    </div>
                    <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-700 mx-2">
                        <div
                            className="h-full bg-black dark:bg-white transition-all duration-300"
                            style={{ width: currentStep >= 3 ? "100%" : "0%" }}
                        ></div>
                    </div>
                    <div className="flex flex-col items-center">
                        <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                currentStep >= 3 ? "bg-black text-white dark:bg-white dark:text-black" : "bg-gray-200 dark:bg-gray-700"
                            }`}
                        >
                            <MapPin className="h-5 w-5" />
                        </div>
                        <span className="text-sm mt-2">Lieu</span>
                    </div>
                </div>
            </div>

            {/* Formulaire avec animation */}
            <AnimatePresence>
                {isFormVisible && (
                    <motion.div
                        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex justify-end"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeForm}
                    >
                        <motion.div
                            className="bg-white dark:bg-gray-900 w-full max-w-2xl h-full overflow-y-auto"
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold">
                                        {currentStep === 1 && "Informations de base"}
                                        {currentStep === 2 && "Dates et horaires"}
                                        {currentStep === 3 && "Lieu et finalisation"}
                                    </h2>
                                    <Button variant="ghost" size="icon" onClick={closeForm}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    {currentStep === 1 && <EventFormStep1 eventData={eventData} handleChange={handleChange} />}
                                    {currentStep === 2 && <EventFormStep2 eventData={eventData} handleChange={handleChange} />}
                                    {currentStep === 3 && <EventFormStep3 eventData={eventData} handleChange={handleChange} />}

                                    <div className="flex justify-between pt-4 border-t">
                                        <Button variant="outline" onClick={currentStep > 1 ? prevStep : closeForm}>
                                            {currentStep > 1 ? (
                                                <>
                                                    <ChevronLeft className="mr-2 h-4 w-4" /> Précédent
                                                </>
                                            ) : (
                                                "Annuler"
                                            )}
                                        </Button>
                                        <Button
                                            onClick={currentStep < 3 ? nextStep : handleSubmit}
                                            disabled={isSubmitting}
                                            className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                                        >
                                            {currentStep < 3 ? (
                                                <>
                                                    Suivant <ChevronRight className="ml-2 h-4 w-4" />
                                                </>
                                            ) : isSubmitting ? (
                                                "Création en cours..."
                                            ) : (
                                                "Créer l'événement"
                                            )}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Contenu de la page derrière le formulaire */}
            <Card className="p-6">
                <div className="text-center py-12">
                    <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h2 className="text-2xl font-bold mb-2">Créez votre événement</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        Remplissez le formulaire pour créer un nouvel événement. Vous pourrez spécifier tous les détails nécessaires
                        en quelques étapes simples.
                    </p>
                    <Button
                        onClick={() => setIsFormVisible(true)}
                        className="bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
                    >
                        Commencer
                    </Button>
                </div>
            </Card>
        </div>
    )
}
