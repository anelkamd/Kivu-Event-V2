import { useState } from "react"
import { Button, Input, Textarea } from "@/components/ui"

export function CreateTaskForm({ eventId }) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleCreate = async () => {
    setLoading(true)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ eventId, title, description }),
    })
    const data = await res.json()
    setLoading(false)
    setSuccess(data.success)
  }

  return (
    <div>
      <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Titre de la tâche" />
      <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
      <Button onClick={handleCreate} disabled={loading || !title}>Créer la tâche</Button>
      {success && <p className="text-green-600">Tâche créée !</p>}
    </div>
  )
}