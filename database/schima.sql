CREATE TABLE facilities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    address VARCHAR(255),
    erp_capacity INTEGER NOT NULL CHECK (erp_capacity > 0)
);

CREATE TABLE clubs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    contact_email VARCHAR(150),
    contact_phone VARCHAR(30)
);

CREATE TABLE families (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    family_quotient DECIMAL(10, 2) CHECK (family_quotient >= 0)
);

CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE NOT NULL,
    medical_certificate_valid_until DATE,
    family_id INTEGER,
    CONSTRAINT fk_members_family FOREIGN KEY (family_id) REFERENCES families (id) ON DELETE SET NULL
);

CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    facility_id INTEGER NOT NULL,
    club_id INTEGER,
    max_capacity INTEGER NOT NULL CHECK (max_capacity > 0),
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    age_min INTEGER CHECK (age_min >= 0),
    age_max INTEGER CHECK (age_max >= 0),
    day_of_week VARCHAR(20),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    CONSTRAINT fk_activities_facility FOREIGN KEY (facility_id) REFERENCES facilities (id) ON DELETE CASCADE,
    CONSTRAINT fk_activities_club FOREIGN KEY (club_id) REFERENCES clubs (id) ON DELETE SET NULL,
    CONSTRAINT chk_activity_age_range CHECK (
        age_max IS NULL
        OR age_min IS NULL
        OR age_max >= age_min
    ),
    CONSTRAINT chk_activity_time CHECK (end_time > start_time),
    CONSTRAINT chk_activity_day CHECK (
        day_of_week IS NULL
        OR day_of_week IN (
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
        )
    )
);

CREATE TABLE registrations (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL,
    activity_id INTEGER NOT NULL,
    registration_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'confirmed',
    final_price DECIMAL(10, 2) NOT NULL CHECK (final_price >= 0),
    CONSTRAINT fk_registrations_member FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE,
    CONSTRAINT fk_registrations_activity FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE,
    CONSTRAINT chk_registration_status CHECK (
        status IN ('pending', 'confirmed', 'cancelled', 'completed')
    ),
    CONSTRAINT uq_member_activity UNIQUE (member_id, activity_id)
);

CREATE TABLE waiting_list (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL,
    activity_id INTEGER NOT NULL,
    position INTEGER NOT NULL CHECK (position > 0),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'waiting',
    CONSTRAINT fk_waiting_member FOREIGN KEY (member_id) REFERENCES members (id) ON DELETE CASCADE,
    CONSTRAINT fk_waiting_activity FOREIGN KEY (activity_id) REFERENCES activities (id) ON DELETE CASCADE,
    CONSTRAINT chk_waiting_status CHECK (status IN ('waiting', 'promoted', 'cancelled')),
    CONSTRAINT uq_waiting_member_activity UNIQUE (member_id, activity_id)
);

-- Facilities
CREATE INDEX idx_facilities_type ON facilities (type);

-- Clubs
CREATE INDEX idx_clubs_name ON clubs (name);

-- Members
CREATE INDEX idx_members_family_id ON members (family_id);

CREATE INDEX idx_members_birth_date ON members (birth_date);

-- Activities
CREATE INDEX idx_activities_facility_id ON activities (facility_id);

CREATE INDEX idx_activities_club_id ON activities (club_id);

CREATE INDEX idx_activities_day_time ON activities (day_of_week, start_time, end_time);

-- Registrations
CREATE INDEX idx_registrations_member_id ON registrations (member_id);

CREATE INDEX idx_registrations_activity_id ON registrations (activity_id);

CREATE INDEX idx_registrations_status ON registrations (status);

-- Waiting list
CREATE INDEX idx_waiting_activity_position ON waiting_list (activity_id, position);

CREATE INDEX idx_waiting_status ON waiting_list (status);

SELECT
    table_name
FROM
    information_schema.tables
WHERE
    table_schema = 'public'
ORDER BY
    table_name;