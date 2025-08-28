export function AssignTaskForm({ taskId, moderators }) {
  const [moderatorId, setModeratorId] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleAssign = async () => {
    setLoading(true)
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tasks/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      body: JSON.stringify({ taskId, moderatorId }),
    })
    const data = await res.json()
    setLoading(false)
    setSuccess(data.success)
  }

  return (
    <div>
      <select value={moderatorId} onChange={e => setModeratorId(e.target.value)}>
        <option value="">Choisir un modérateur</option>
        {moderators.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
      <Button onClick={handleAssign} disabled={loading || !moderatorId}>Assigner</Button>
      {success && <p className="text-green-600">Tâche assignée !</p>}
    </div>
  )
}