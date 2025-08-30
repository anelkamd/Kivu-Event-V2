import { sequelize } from "../config/database.js"

// Créer une tâche
export const createTask = async (req, res) => {
  try {
    const {
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
    } = req.body;

    const createdBy = req.user.id; // ⚠️ adapte selon ton middleware auth

    // deadline → format SQL
    const formattedDeadline = deadline
      ? deadline.replace("T", " ") + ":00"
      : null;

    await sequelize.query(
      `INSERT INTO tasks (
        id, event_id, title, description, priority, deadline, category,
        estimated_hours, budget_allocated, validation_required, status,
        created_by, required_resources, tags
      ) VALUES (
        UUID(), ?, ?, ?, ?, ?, ?, ?, ?, ?, 'a_faire', ?, ?, ?
      )`,
      {
        replacements: [
          eventId,
          title,
          description,
          priority,
          formattedDeadline,
          category,
          estimatedHours,
          budgetAllocated,
          validationRequired ? 1 : 0,
          createdBy,
          requiredResources ? JSON.stringify(requiredResources) : JSON.stringify([]), // ✅ correction
          tags ? JSON.stringify(tags.split(",").map(t => t.trim())) : JSON.stringify([]), // ✅ correction
        ],
      }
    );

    res.json({ success: true, message: "Tâche créée avec succès !" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, error: error.message });
  }
};



// Récupérer toutes les tâches d'un événement
export const getTasksByEvent = async (req, res) => {
  try {
    const { eventId } = req.params
    const [tasks] = await sequelize.query(
      "SELECT * FROM tasks WHERE event_id = ? ORDER BY deadline ASC",
      { replacements: [eventId] }
    )
    res.json({ success: true, data: tasks })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// Assigner une tâche à un modérateur
export const assignTask = async (req, res) => {
  try {
    const { taskId, moderatorId } = req.body
    await sequelize.query(
      "UPDATE tasks SET assigned_to = ? WHERE id = ?",
      { replacements: [moderatorId, taskId] }
    )
    res.json({ success: true, message: "Tâche assignée !" })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// Mettre à jour une tâche (statut, progression, etc.)
export const updateTask = async (req, res) => {
  try {
    const { taskId } = req.params
    const updates = req.body

    const fields = []
    const values = []
    for (const key in updates) {
      fields.push(`${key} = ?`)
      values.push(updates[key])
    }
    values.push(taskId)

    await sequelize.query(
      `UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`,
      { replacements: values }
    )

    res.json({ success: true, message: "Tâche mise à jour !" })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// Supprimer une tâche
export const deleteTask = async (req, res) => {
  try {
    const { taskId } = req.params
    await sequelize.query("DELETE FROM tasks WHERE id = ?", {
      replacements: [taskId],
    })
    res.json({ success: true, message: "Tâche supprimée !" })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}
