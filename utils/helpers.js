// Générer un ID unique
export const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

// Formater une date
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

// Nettoyer les données d'entrée
export const sanitizeInput = (input) => {
  if (typeof input === "string") {
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  }
  return input
}

// Calculer la pagination
export const calculatePagination = (totalItems, currentPage, itemsPerPage) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const hasNext = currentPage < totalPages
  const hasPrev = currentPage > 1

  return {
    totalPages,
    hasNext,
    hasPrev,
    startIndex: (currentPage - 1) * itemsPerPage,
    endIndex: currentPage * itemsPerPage,
  }
}
