import moderatorService from "../services/moderatorService.js"
import EventModerator from "../models/EventModerator.js"
import Task from "../models/Task.js"
import Event from "../models/Event.js"
import User from "../models/User.js"
import { Op } from "sequelize"

// Inviter un modérateur
export const inviteModerator = async (req, res) => {
  try {
    const { email, eventId } = req.body
    // Vérifie que l'utilisateur est bien organisateur de l'événement
    // (à adapter selon ta logique)
    await moderatorService.invite(email, eventId, req.user)
    res.json({ success: true, message: "Invitation envoyée !" })
  } catch (error) {
    res.status(400).json({ success: false, error: error.message })
  }
}

// Obtenir les modérateurs d'un événement
export const getEventModerators = async (req, res) => {
  try {
    const { eventId } = req.params

    const moderators = await moderatorService.getEventModerators(eventId)

    res.json({
      success: true,
      data: moderators,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des modérateurs:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Révoquer un modérateur
export const revokeModerator = async (req, res) => {
  try {
    const organizerId = req.user.id
    const { eventId, moderatorId } = req.params

    const result = await moderatorService.revokeModerator(organizerId, eventId, moderatorId)

    res.json({
      success: true,
      message: result.message,
    })
  } catch (error) {
    console.error("Erreur lors de la révocation du modérateur:", error)
    res.status(400).json({
      success: false,
      message: error.message,
    })
  }
}

// Dashboard du modérateur
export const getModeratorDashboard = async (req, res) => {
  try {
    const moderatorId = req.user.id

    // Obtenir les événements assignés au modérateur
    const eventAssignments = await EventModerator.findAll({
      where: { moderatorId, isActive: true },
      include: [
        {
          model: Event,
          as: "event",
          include: [
            {
              model: User,
              as: "organizer",
              attributes: ["id", "firstName", "lastName", "email"],
            },
          ],
        },
      ],
    })

    // Obtenir les tâches en attente de validation
    const pendingTasks = await Task.findAll({
      where: {
        moderatorId,
        status: "en_attente_validation",
      },
      include: [
        {
          model: Event,
          as: "event",
          attributes: ["id", "title"],
        },
        {
          model: User,
          as: "assignedUser",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [["deadline", "ASC"]],
    })

    // Statistiques
    const totalEvents = eventAssignments.length
    const totalPendingTasks = pendingTasks.length

    const tasksValidatedToday = await Task.count({
      where: {
        validatedBy: moderatorId,
        validatedAt: {
          [Op.gte]: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    })

    res.json({
      success: true,
      data: {
        events: eventAssignments,
        pendingTasks,
        statistics: {
          totalEvents,
          totalPendingTasks,
          tasksValidatedToday,
        },
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération du dashboard modérateur:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Valider une tâche
export const validateTask = async (req, res) => {
  try {
    const moderatorId = req.user.id
    const { taskId } = req.params
    const { action, notes } = req.body // action: 'approve' ou 'reject'

    const task = await Task.findByPk(taskId, {
      include: [
        {
          model: Event,
          as: "event",
        },
      ],
    })

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Tâche non trouvée",
      })
    }

    // Vérifier que le modérateur est assigné à cet événement
    const eventModerator = await EventModerator.findOne({
      where: {
        eventId: task.eventId,
        moderatorId,
        isActive: true,
      },
    })

    if (!eventModerator) {
      return res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à valider cette tâche",
      })
    }

    // Mettre à jour la tâche selon l'action
    if (action === "approve") {
      task.status = "validee"
      task.validatedBy = moderatorId
      task.validatedAt = new Date()
      task.validationNotes = notes
      task.completionDate = new Date()
      task.progressPercentage = 100
    } else if (action === "reject") {
      task.status = "rejetee"
      task.validatedBy = moderatorId
      task.validatedAt = new Date()
      task.rejectionReason = notes
      task.progressPercentage = Math.max(0, task.progressPercentage - 10) // Réduire le progrès
    }

    await task.save()

    res.json({
      success: true,
      message: action === "approve" ? "Tâche validée avec succès" : "Tâche rejetée",
      data: task,
    })
  } catch (error) {
    console.error("Erreur lors de la validation de la tâche:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

// Obtenir les tâches à valider pour un modérateur
export const getTasksToValidate = async (req, res) => {
  try {
    const moderatorId = req.user.id
    const { eventId, status, priority } = req.query

    const where = {
      moderatorId,
    }

    if (eventId) where.eventId = eventId
    if (status) where.status = status
    if (priority) where.priority = priority

    const tasks = await Task.findAll({
      where,
      include: [
        {
          model: Event,
          as: "event",
          attributes: ["id", "title"],
        },
        {
          model: User,
          as: "assignedUser",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: User,
          as: "createdByUser",
          attributes: ["id", "firstName", "lastName", "email"],
        },
      ],
      order: [
        ["priority", "DESC"],
        ["deadline", "ASC"],
      ],
    })

    res.json({
      success: true,
      data: tasks,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches à valider:", error)
    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}
