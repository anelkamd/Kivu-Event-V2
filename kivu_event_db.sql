-- Création de la base de données
CREATE DATABASE IF NOT EXISTS kivu_event;
USE kivu_event;

-- Création de la table 'users'
CREATE TABLE `users` (
    `id` CHAR(36) BINARY PRIMARY KEY DEFAULT (UUID()),
    `first_name` VARCHAR(100) NOT NULL,
    `last_name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'organizer', 'participant') NOT NULL DEFAULT 'participant',
    `phone_number` VARCHAR(20) DEFAULT NULL,
    `profile_image` VARCHAR(255) DEFAULT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `reset_password_token` VARCHAR(255) DEFAULT NULL,
    `reset_password_expire` DATETIME DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin; -- Utilisation de utf8mb4_bin pour les UUIDs

-- Création de la table 'venues'
CREATE TABLE `venues` (
    `id` CHAR(36) BINARY PRIMARY KEY DEFAULT (UUID()),
    `name` VARCHAR(100) NOT NULL,
    `address` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NOT NULL,
    `state` VARCHAR(100) DEFAULT NULL,
    `country` VARCHAR(100) NOT NULL,
    `postal_code` VARCHAR(20) DEFAULT NULL,
    `capacity` INTEGER NOT NULL,
    `facilities` TEXT DEFAULT NULL,
    `contact_name` VARCHAR(100) DEFAULT NULL,
    `contact_email` VARCHAR(100) DEFAULT NULL,
    `contact_phone` VARCHAR(20) DEFAULT NULL,
    `description` TEXT DEFAULT NULL,
    `images` TEXT DEFAULT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Création de la table 'speakers'
CREATE TABLE `speakers` (
    `id` CHAR(36) BINARY PRIMARY KEY DEFAULT (UUID()),
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `bio` TEXT DEFAULT NULL,
    `expertise` TEXT DEFAULT NULL,
    `company` VARCHAR(100) DEFAULT NULL,
    `job_title` VARCHAR(100) DEFAULT NULL,
    `profile_image` VARCHAR(255) DEFAULT NULL,
    `linkedin` VARCHAR(255) DEFAULT NULL,
    `twitter` VARCHAR(255) DEFAULT NULL,
    `website` VARCHAR(255) DEFAULT NULL,
    `rating` FLOAT DEFAULT 5.0,
    `is_active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Création de la table 'events'
CREATE TABLE `events` (
    `id` CHAR(36) BINARY PRIMARY KEY DEFAULT (UUID()),
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `type` ENUM('conference', 'seminar', 'workshop', 'meeting', 'other') NOT NULL,
    `start_date` DATETIME NOT NULL,
    `end_date` DATETIME NOT NULL,
    `capacity` INTEGER NOT NULL,
    `registration_deadline` DATETIME DEFAULT NULL,
    `status` ENUM('draft', 'published', 'cancelled', 'completed') NOT NULL DEFAULT 'draft',
    `price` DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    `tags` TEXT DEFAULT NULL,
    `image` VARCHAR(255) DEFAULT NULL,
    `venue_id` CHAR(36) BINARY DEFAULT NULL,
    `organizer_id` CHAR(36) BINARY NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`venue_id`) REFERENCES `venues`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (`organizer_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Création de la table de liaison 'event_speakers' (pour la relation Many-to-Many)
CREATE TABLE `event_speakers` (
    `event_id` CHAR(36) BINARY NOT NULL,
    `speaker_id` CHAR(36) BINARY NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`event_id`, `speaker_id`),
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (`speaker_id`) REFERENCES `speakers`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Création de la table 'participants'
CREATE TABLE `participants` (
    `id` CHAR(36) BINARY PRIMARY KEY DEFAULT (UUID()),
    `user_id` CHAR(36) BINARY DEFAULT NULL, -- NULLABLE pour l'inscription anonyme
    `event_id` CHAR(36) BINARY NOT NULL, -- NOT NULL
    `first_name` VARCHAR(100) DEFAULT NULL, -- Pour les participants anonymes
    `last_name` VARCHAR(100) DEFAULT NULL,  -- Pour les participants anonymes
    `email` VARCHAR(100) DEFAULT NULL,     -- Pour les participants anonymes (peut être NULL si user_id est présent)
    `registration_date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `status` ENUM('registered', 'attended', 'cancelled', 'no-show') NOT NULL DEFAULT 'registered',
    `company` VARCHAR(100) DEFAULT NULL,
    `job_title` VARCHAR(100) DEFAULT NULL,
    `dietary_restrictions` VARCHAR(255) DEFAULT NULL,
    `special_requirements` TEXT DEFAULT NULL,
    `feedback_rating` INTEGER DEFAULT NULL,
    `feedback_comment` TEXT DEFAULT NULL,
    `feedback_submitted_at` DATETIME DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE, -- ON DELETE SET NULL pour user_id
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE, -- ON DELETE NO ACTION pour event_id
    UNIQUE KEY `user_id_event_id_unique` (`user_id`, `event_id`) -- Index unique pour éviter les doublons pour les utilisateurs connectés
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Création de la table 'agendas'
CREATE TABLE `agendas` (
    `id` CHAR(36) BINARY PRIMARY KEY DEFAULT (UUID()),
    `event_id` CHAR(36) BINARY NOT NULL, -- NOT NULL
    `title` VARCHAR(255) NOT NULL,
    `description` TEXT DEFAULT NULL,
    `start_time` DATETIME NOT NULL,
    `end_time` DATETIME NOT NULL,
    `speaker_id` CHAR(36) BINARY DEFAULT NULL, -- NULLABLE
    `location` VARCHAR(255) DEFAULT NULL,
    `type` ENUM('presentation', 'workshop', 'break', 'networking', 'other') NOT NULL DEFAULT 'presentation',
    `materials` TEXT DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE, -- ON DELETE NO ACTION pour event_id
    FOREIGN KEY (`speaker_id`) REFERENCES `speakers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE -- ON DELETE SET NULL pour speaker_id
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Création de la table 'payments'
CREATE TABLE `payments` (
    `id` CHAR(36) BINARY PRIMARY KEY DEFAULT (UUID()),
    `user_id` CHAR(36) BINARY NOT NULL, -- NOT NULL
    `event_id` CHAR(36) BINARY NOT NULL, -- NOT NULL
    `amount` DECIMAL(10,2) NOT NULL,
    `currency` VARCHAR(3) NOT NULL DEFAULT 'USD',
    `status` ENUM('pending', 'completed', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
    `payment_intent_id` VARCHAR(255) DEFAULT NULL,
    `payment_method` VARCHAR(50) DEFAULT NULL,
    `receipt_url` VARCHAR(255) DEFAULT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE, -- ON DELETE NO ACTION pour user_id
    FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE -- ON DELETE NO ACTION pour event_id
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;
