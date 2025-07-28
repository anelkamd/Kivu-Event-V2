import express from "express"
import { sequelize } from "../config/database.js"
import { protect, authorize } from "../middleware/auth.middleware.js"
import { v4 as uuidv4 } from "uuid"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Middleware pour vérifier les droits admin
router.use(protect)
router.use(authorize("admin"))

// GET /api/admin/database - Obtenir les informations sur les tables
router.get("/database", async (req, res) => {
  try {
    // Obtenir la liste des tables
    const [tables] = await sequelize.query("SHOW TABLES")

    const databaseInfo = {
      tables: [],
      totalRecords: 0,
    }

    for (const table of tables) {
      const tableName = Object.values(table)[0]

      // Obtenir le nombre d'enregistrements
      const [countResult] = await sequelize.query(`SELECT COUNT(*) as count FROM ${tableName}`)
      const count = countResult[0].count

      // Obtenir la structure de la table
      const [structure] = await sequelize.query(`DESCRIBE ${tableName}`)

      databaseInfo.tables.push({
        name: tableName,
        recordCount: count,
        structure: structure,
      })

      databaseInfo.totalRecords += count
    }

    res.json({
      success: true,
      data: databaseInfo,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des informations de base de données:", error)
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    })
  }
})

// GET /api/admin/database/:table - Obtenir les données d'une table
router.get("/database/:table", async (req, res) => {
  try {
    const { table } = req.params
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 50
    const offset = (page - 1) * limit

    // Vérifier que la table existe
    const [tableExists] = await sequelize.query("SHOW TABLES LIKE ?", {
      replacements: [table],
    })

    if (tableExists.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Table non trouvée",
      })
    }

    // Obtenir le nombre total d'enregistrements
    const [totalResult] = await sequelize.query(`SELECT COUNT(*) as total FROM ${table}`)
    const total = totalResult[0].total

    // Obtenir les données avec pagination
    const [records] = await sequelize.query(`SELECT * FROM ${table} LIMIT ? OFFSET ?`, {
      replacements: [limit, offset],
    })

    // Obtenir la structure de la table
    const [structure] = await sequelize.query(`DESCRIBE ${table}`)

    res.json({
      success: true,
      data: {
        table: table,
        records: records,
        structure: structure,
        pagination: {
          page: page,
          limit: limit,
          total: total,
          totalPages: Math.ceil(total / limit),
        },
      },
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des données:", error)
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    })
  }
})

// POST /api/admin/database - Opérations sur la base de données
router.post("/database", async (req, res) => {
  try {
    const { action, tableName, data } = req.body

    switch (action) {
      case "create_tables":
        try {
          // Lire le fichier de schéma
          const schemaPath = path.join(__dirname, "..", "database", "schema.sql")

          if (fs.existsSync(schemaPath)) {
            const schema = fs.readFileSync(schemaPath, "utf8")

            // Diviser les requêtes par point-virgule
            const statements = schema
              .split(";")
              .map((stmt) => stmt.trim())
              .filter((stmt) => stmt.length > 0 && !stmt.startsWith("--"))

            // Exécuter chaque requête
            for (const statement of statements) {
              if (statement.trim()) {
                await sequelize.query(statement)
              }
            }

            res.json({
              success: true,
              message: "Tables créées avec succès",
            })
          } else {
            res.status(404).json({
              success: false,
              error: "Fichier de schéma non trouvé",
            })
          }
        } catch (error) {
          console.error("Erreur lors de la création des tables:", error)
          res.status(500).json({
            success: false,
            error: "Erreur lors de la création des tables: " + error.message,
          })
        }
        break

      case "add_record":
        if (!tableName || !data) {
          return res.status(400).json({
            success: false,
            error: "Nom de table et données requis",
          })
        }

        try {
          // Ajouter un UUID si nécessaire
          if (!data.id) {
            data.id = uuidv4()
          }

          const columns = Object.keys(data).join(", ")
          const placeholders = Object.keys(data)
            .map(() => "?")
            .join(", ")
          const values = Object.values(data)

          await sequelize.query(`INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`, {
            replacements: values,
          })

          res.json({
            success: true,
            message: `Enregistrement ajouté à ${tableName}`,
          })
        } catch (error) {
          console.error("Erreur lors de l'ajout:", error)
          res.status(500).json({
            success: false,
            error: "Erreur lors de l'ajout: " + error.message,
          })
        }
        break

      case "update_record":
        if (!tableName || !data || !data.id) {
          return res.status(400).json({
            success: false,
            error: "Données invalides",
          })
        }

        try {
          const { id, ...updateData } = data
          const updateColumns = Object.keys(updateData)
            .map((key) => `${key} = ?`)
            .join(", ")
          const updateValues = [...Object.values(updateData), id]

          await sequelize.query(`UPDATE ${tableName} SET ${updateColumns} WHERE id = ?`, {
            replacements: updateValues,
          })

          res.json({
            success: true,
            message: `Enregistrement mis à jour dans ${tableName}`,
          })
        } catch (error) {
          console.error("Erreur lors de la mise à jour:", error)
          res.status(500).json({
            success: false,
            error: "Erreur lors de la mise à jour: " + error.message,
          })
        }
        break

      case "delete_record":
        if (!tableName || !data?.id) {
          return res.status(400).json({
            success: false,
            error: "ID requis",
          })
        }

        try {
          await sequelize.query(`DELETE FROM ${tableName} WHERE id = ?`, {
            replacements: [data.id],
          })

          res.json({
            success: true,
            message: `Enregistrement supprimé de ${tableName}`,
          })
        } catch (error) {
          console.error("Erreur lors de la suppression:", error)
          res.status(500).json({
            success: false,
            error: "Erreur lors de la suppression: " + error.message,
          })
        }
        break

      default:
        res.status(400).json({
          success: false,
          error: "Action non reconnue",
        })
    }
  } catch (error) {
    console.error("Erreur lors de l'opération sur la base de données:", error)
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    })
  }
})

// GET /api/admin/stats - Statistiques générales
router.get("/stats", async (req, res) => {
  try {
    const stats = {}

    // Statistiques des utilisateurs
    const [userStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
        SUM(CASE WHEN role = 'organizer' THEN 1 ELSE 0 END) as organizers,
        SUM(CASE WHEN role = 'participant' THEN 1 ELSE 0 END) as participants,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active
      FROM users
    `)
    stats.users = userStats[0]

    // Statistiques des événements
    const [eventStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM events
    `)
    stats.events = eventStats[0]

    // Statistiques des participants
    const [participantStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'registered' THEN 1 ELSE 0 END) as registered,
        SUM(CASE WHEN status = 'attended' THEN 1 ELSE 0 END) as attended,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN status = 'no-show' THEN 1 ELSE 0 END) as noShow
      FROM participants
    `)
    stats.participants = participantStats[0]

    // Statistiques des revenus
    const [revenueStats] = await sequelize.query(`
      SELECT 
        COUNT(*) as totalPayments,
        SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as totalRevenue,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pendingRevenue,
        SUM(CASE WHEN status = 'refunded' THEN amount ELSE 0 END) as refundedAmount
      FROM payments
    `)
    stats.revenue = revenueStats[0]

    res.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    res.status(500).json({
      success: false,
      error: "Erreur serveur",
    })
  }
})

export default router
