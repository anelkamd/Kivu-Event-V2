"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function CreateTaskForm({ onTaskCreated }) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(1)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [priority, setPriority] = useState("normale")
  const [category, setCategory] = useState("")
  const [estimatedHours, setEstimatedHours] = useState(1)
  const [deadline, setDeadline] = useState("")
  const [eventId, setEventId] = useState("")
  const [validationRequired, setValidationRequired] = useState(false)
  const [requiredResources, setRequiredResources] = useState("")
  const [budgetAllocated, setBudgetAllocated] = useState("")
  const [tags, setTags] = useState("")
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/my-events`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setEvents(data.data || []))
  }, [])

  const resetForm = () => {
    setStep(1)
    setTitle("")
    setDescription("")
    setPriority("normale")
    setCategory("")
    setEstimatedHours(1)
    setDeadline("")
    setEventId("")
    setValidationRequired(false)
    setRequiredResources("")
    setBudgetAllocated("")
    setTags("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    const payload = {
      eventId,
      title,
      description,
      priority,
      deadline,
      category,
      estimatedHours,
      budgetAllocated,
      validationRequired,
      requiredResources,
      tags,
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        resetForm()
        toast({
          title: "✅ Tâche créée avec succès !",
          description: `La tâche "${title}" a été ajoutée à votre événement.`,
          duration: 4000,
        })
        setOpen(false)
        if (onTaskCreated) onTaskCreated()
      } else {
        const data = await res.json()
        setError(data.error || "Erreur lors de la création")
      }
    } catch (err) {
      setError("Erreur réseau")
    }
    setLoading(false)
  }

  const handleNext = (e) => {
    e.preventDefault()
    setStep(2)
  }

  const handleBack = (e) => {
    e.preventDefault()
    setStep(1)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Créer une tâche
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader>
          <DialogTitle>Nouvelle tâche</DialogTitle>
        </DialogHeader>
        <form className="space-y-6" onSubmit={step === 2 ? handleSubmit : handleNext}>
          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium mb-1">Événement associé</label>
                <select
                  className="w-full border rounded px-2 py-2 mb-4"
                  value={eventId}
                  onChange={(e) => setEventId(e.target.value)}
                  required
                >
                  <option value="">Sélectionner un événement</option>
                  {events.map((ev) => (
                    <option key={ev.id} value={ev.id}>
                      {ev.title}
                    </option>
                  ))}
                </select>
                <Input
                  placeholder="Titre de la tâche"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="mb-4"
                />
                <Textarea
                  placeholder="Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="mb-4"
                  rows={4}
                />
              </div>
              <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium mb-1">Priorité</label>
                <select
                  className="w-full border rounded px-2 py-2 mb-4"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <option value="basse">Basse</option>
                  <option value="normale">Normale</option>
                  <option value="haute">Haute</option>
                  <option value="critique">Critique</option>
                </select>
                <Input
                  placeholder="Catégorie"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="mb-4"
                />
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-4">
                <label className="block text-sm font-medium mb-1">Heures estimées</label>
                <Input
                  type="number"
                  min={1}
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(Number(e.target.value))}
                  required
                  className="mb-4"
                />
                <label className="block text-sm font-medium mb-1">Échéance</label>
                <Input
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  required
                  className="mb-4"
                />
                <label className="block text-sm font-medium mb-1">Validation requise</label>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    checked={validationRequired}
                    onChange={(e) => setValidationRequired(e.target.checked)}
                    className="mr-2"
                  />
                  <span>Oui</span>
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <Input
                  placeholder="Ressources nécessaires"
                  value={requiredResources}
                  onChange={(e) => setRequiredResources(e.target.value)}
                  className="mb-4"
                />
                <Input
                  placeholder="Budget alloué"
                  type="number"
                  min={0}
                  value={budgetAllocated}
                  onChange={(e) => setBudgetAllocated(e.target.value)}
                  className="mb-4"
                />
                <Input
                  placeholder="Tags (séparés par des virgules)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="mb-4"
                />
                {/* 🔴 Champ fichier désactivé pour l’instant */}
              </div>
            </div>
          )}
          <div className="flex gap-2 mt-4">
            {step === 2 && (
              <Button variant="outline" type="button" onClick={handleBack}>
                Retour
              </Button>
            )}
            <Button type="submit" className="flex-1" disabled={loading}>
              {step === 1 ? "Suivant" : loading ? "Enregistrement..." : "Créer la tâche"}
            </Button>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </form>
      </DialogContent>
    </Dialog>
  )
}
