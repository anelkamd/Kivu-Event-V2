export const validateEventData = (data, isRequired = true) => {
  const errors = []

  // Validation des champs obligatoires
  if (isRequired) {
    if (!data.title || data.title.trim().length === 0) {
      errors.push("Le titre est obligatoire")
    }

    if (!data.description || data.description.trim().length === 0) {
      errors.push("La description est obligatoire")
    }

    if (!data.type && !data.category) {
      errors.push("La catégorie est obligatoire")
    }

    if (!data.startDate) {
      errors.push("La date de début est obligatoire")
    }

    if (!data.endDate) {
      errors.push("La date de fin est obligatoire")
    }

    if (!data.capacity || data.capacity <= 0) {
      errors.push("La capacité doit être supérieure à 0")
    }
  }

  // Validation des dates
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate)
    const endDate = new Date(data.endDate)

    if (startDate >= endDate) {
      errors.push("La date de fin doit être postérieure à la date de début")
    }

    if (data.registrationDeadline) {
      const regDeadline = new Date(data.registrationDeadline)
      if (regDeadline >= startDate) {
        errors.push("La date limite d'inscription doit être antérieure à la date de début")
      }
    }
  }

  // Validation du prix
  if (data.price && (isNaN(data.price) || data.price < 0)) {
    errors.push("Le prix doit être un nombre positif")
  }

  // Validation de la capacité
  if (data.capacity && (isNaN(data.capacity) || data.capacity <= 0)) {
    errors.push("La capacité doit être un nombre positif")
  }

  // Validation du statut
  if (data.status && !["draft", "published", "cancelled"].includes(data.status)) {
    errors.push("Statut invalide")
  }

  // Validation du type/catégorie
  const validTypes = ["conference", "seminar", "workshop", "meeting"]
  if ((data.type || data.category) && !validTypes.includes(data.type || data.category)) {
    errors.push("Type d'événement invalide")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}