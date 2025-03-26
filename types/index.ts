export interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "admin" | "organizer" | "participant"
  phoneNumber?: string
  profileImage?: string
  createdAt: string
  updatedAt: string
}

export interface Event {
  id: string
  title: string
  description: string
  type: "conference" | "seminar" | "workshop" | "meeting"
  startDate: string
  endDate: string
  capacity: number
  registrationDeadline: string
  status: "draft" | "published" | "cancelled" | "completed"
  image?: string
  tags: string[]
  venue: Venue
  organizer: User
  speakers: Speaker[]
  agenda: AgendaItem[]
  participants: Participant[]
  createdAt: string
  updatedAt: string
}

export interface Venue {
  id: string
  name: string
  street: string
  city: string
  state?: string
  country: string
  postalCode?: string
  capacity: number
  facilities: string[]
  contactName?: string
  contactEmail?: string
  contactPhone?: string
  description?: string
  images?: string[]
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Speaker {
  id: string
  name: string
  email: string
  bio: string
  expertise: string[]
  company?: string
  jobTitle?: string
  profileImage?: string
  linkedin?: string
  twitter?: string
  website?: string
  rating?: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Participant {
  id: string
  userId: string
  eventId: string
  registrationDate: string
  status: "registered" | "attended" | "cancelled" | "no-show"
  company?: string
  jobTitle?: string
  dietaryRestrictions?: string
  specialRequirements?: string
  feedbackRating?: number
  feedbackComment?: string
  feedbackSubmittedAt?: string
  user?: User
  createdAt: string
  updatedAt: string
}

export interface AgendaItem {
  id: string
  eventId: string
  title: string
  description?: string
  startTime: string
  endTime: string
  speakerId?: string
  speaker?: Speaker
  location?: string
  type: "presentation" | "workshop" | "break" | "networking" | "other"
  materials?: string
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  success: boolean
  count: number
  pagination: {
    total: number
    page: number
    pages: number
  }
  data: T[]
}

export interface ApiResponse<T> {
  success: boolean
  data: T
}

