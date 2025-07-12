-- Création de la base de données
CREATE DATABASE IF NOT EXISTS kivu_event;
USE kivu_event;

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'organizer', 'participant') DEFAULT 'participant',
    phone_number VARCHAR(20) DEFAULT NULL,
    profile_image VARCHAR(255) DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    reset_password_token VARCHAR(255) DEFAULT NULL,
    reset_password_expire DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des lieux
CREATE TABLE IF NOT EXISTS venues (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    street VARCHAR(255) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT NULL,
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) DEFAULT NULL,
    capacity INT NOT NULL,
    facilities TEXT DEFAULT NULL,
    contact_name VARCHAR(100) DEFAULT NULL,
    contact_email VARCHAR(100) DEFAULT NULL,
    contact_phone VARCHAR(20) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    images TEXT DEFAULT NULL,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des intervenants
CREATE TABLE IF NOT EXISTS speakers (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    bio TEXT NOT NULL,
    expertise TEXT DEFAULT NULL,
    company VARCHAR(100) DEFAULT NULL,
    job_title VARCHAR(100) DEFAULT NULL,
    profile_image VARCHAR(255) DEFAULT NULL,
    linkedin VARCHAR(255) DEFAULT NULL,
    twitter VARCHAR(255) DEFAULT NULL,
    website VARCHAR(255) DEFAULT NULL,
    rating FLOAT DEFAULT 5.0,
    is_active TINYINT(1) DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table des événements
CREATE TABLE IF NOT EXISTS events (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type ENUM('conference', 'seminar', 'workshop', 'meeting') NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    capacity INT NOT NULL,
    registration_deadline DATETIME NOT NULL,
    status ENUM('draft', 'published', 'cancelled', 'completed') DEFAULT 'draft',
    image VARCHAR(255) DEFAULT NULL,
    tags TEXT DEFAULT NULL,
    price INT DEFAULT 0,
    organizer_id CHAR(36) NULL,
    venue_id CHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (venue_id) REFERENCES venues(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table de jonction entre événements et intervenants
CREATE TABLE IF NOT EXISTS event_speakers (
    event_id CHAR(36) NULL,
    speaker_id CHAR(36) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (event_id, speaker_id),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (speaker_id) REFERENCES speakers(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table des participants
CREATE TABLE IF NOT EXISTS participants (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NULL,
    event_id CHAR(36) NULL,
    registration_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('registered', 'attended', 'cancelled', 'no-show') DEFAULT 'registered',
    company VARCHAR(100) DEFAULT NULL,
    job_title VARCHAR(100) DEFAULT NULL,
    dietary_restrictions VARCHAR(255) DEFAULT NULL,
    special_requirements TEXT DEFAULT NULL,
    feedback_rating INT DEFAULT NULL,
    feedback_comment TEXT DEFAULT NULL,
    feedback_submitted_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (user_id, event_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table des notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(36) PRIMARY KEY,
    user_id CHAR(36) NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read TINYINT(1) DEFAULT 0,
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NULL,
    event_id CHAR(36) NULL,
    amount INT NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    payment_intent_id VARCHAR(255) DEFAULT NULL,
    payment_method VARCHAR(50) DEFAULT NULL,
    receipt_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Table pour les rapports
CREATE TABLE IF NOT EXISTS reports (
    id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id CHAR(36) NULL,
    title VARCHAR(255) NOT NULL,
    type ENUM('events', 'participants', 'revenue') NOT NULL,
    format ENUM('pdf', 'csv', 'excel') NOT NULL,
    parameters TEXT DEFAULT NULL,
    file_url VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- Création d'un utilisateur administrateur par défaut
INSERT INTO users (id, first_name, last_name, email, password, role)
VALUES (
    UUID(),
    'Anelka',
    'CEO',
    'admin@kivuevent.com',
    '$2a$10$hWAcWkSyNRX7OqUskh9rOeqv1A/fZVVtfM8YLMJkUokphCgM/kf/q',
    'admin'
);

-- Création d'un lieu par défaut
INSERT INTO venues (id, name, street, city, country, capacity)
VALUES (
    UUID(),
    'Siège Kivu Event',
    '123 Avenue Principale',
    'Kinshasa',
    'République Démocratique du Congo',
    100
);

-- Création d'un intervenant par défaut
INSERT INTO speakers (id, name, email, bio, expertise)
VALUES (
    UUID(),
    'Anelka MD',
    'anelkamd@gmail.com',
    'Web Developer',
    'Développeur web full stack'
);
