export interface Event {
    id: string;
    title: string;
    description: string;
    type: 'conference' | 'seminar' | 'workshop' | 'meeting';
    start_date: string;
    end_date: string;
    capacity: number;
    registration_deadline: string;
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    image?: string;
    tags?: string;
    price: number;
    organizer_id: string;
    venue_id: string;
    created_at: string;
    updated_at: string;

    // Propriétés jointes (non stockées directement dans la table events)
    organizer?: {
        id: string;
        name: string;
    };
    venue?: {
        id: string;
        name: string;
        address: string;
        capacity: number;
    };
}

export interface Participant {
    id: string;
    user_id: string;
    event_id: string;
    registration_date: string;
    status: 'registered' | 'attended' | 'cancelled' | 'no-show';
    company?: string;
    job_title?: string;
    dietary_restrictions?: string;
    special_requirements?: string;
    feedback_rating?: number;
    feedback_comment?: string;
    feedback_submitted_at?: string;
    created_at: string;
    updated_at: string;

    // Propriétés jointes (non stockées directement dans la table participants)
    user?: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    };
    qrCode?: string; // Généré dynamiquement
}

export interface Speaker {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    bio?: string;
    company?: string;
    job_title?: string;
    photo?: string;
    created_at: string;
    updated_at: string;
}

export interface Venue {
    id: string;
    name: string;
    address: string;
    city: string;
    state?: string;
    country: string;
    postal_code?: string;
    capacity: number;
    contact_name?: string;
    contact_email?: string;
    contact_phone?: string;
    created_at: string;
    updated_at: string;
}
