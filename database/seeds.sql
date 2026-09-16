-- ============================================================
-- Sconnect Pro
-- PostgreSQL Seed Data
-- ============================================================

-- ============================================================
-- 1. FACILITIES
-- ============================================================

INSERT INTO facilities (name, type, address, erp_capacity)
VALUES
    ('Complexe Sportif Municipal', 'Gymnase',
     'Avenue Mohammed VI', 200),

    ('Piscine Municipale', 'Bassin',
     'Rue Ibn Sina', 120),

    ('Dojo Municipal', 'Dojo',
     'Boulevard Hassan II', 60),

    ('Stade Municipal', 'Stade',
     'Route de Casablanca', 500);


-- ============================================================
-- 2. CLUBS
-- ============================================================

INSERT INTO clubs (name, description, contact_email, contact_phone)
VALUES
    ('Atlas Sports Club',
     'Association sportive spécialisée dans les sports collectifs.',
     'contact@atlassports.ma',
     '0611223344'),

    ('Marrakech Natation',
     'Club municipal de natation pour enfants et adultes.',
     'contact@marrakechnatation.ma',
     '0622334455'),

    ('Dojo Marrakech',
     'Association dédiée aux arts martiaux.',
     'contact@dojomarrakech.ma',
     '0633445566');


-- ============================================================
-- 3. FAMILIES
-- ============================================================

INSERT INTO families (name, family_quotient)
VALUES
    ('Famille El Amrani', 2500.00),
    ('Famille Benali', 3200.00),
    ('Famille Alaoui', 1800.00),
    ('Famille Idrissi', 4200.00),
    ('Famille Tazi', 2100.00);


-- ============================================================
-- 4. MEMBERS
-- ============================================================

INSERT INTO members (
    first_name,
    last_name,
    birth_date,
    medical_certificate_valid_until,
    family_id
)
VALUES
    ('Adam', 'El Amrani',
     '2015-04-12',
     '2027-06-30',
     1),

    ('Yassine', 'El Amrani',
     '2017-09-20',
     '2027-06-30',
     1),

    ('Sara', 'Benali',
     '2013-02-15',
     '2027-05-31',
     2),

    ('Omar', 'Benali',
     '2018-11-03',
     '2027-05-31',
     2),

    ('Aya', 'Alaoui',
     '2010-07-25',
     '2026-12-31',
     3),

    ('Hamza', 'Idrissi',
     '2005-03-18',
     '2027-03-31',
     4),

    ('Salma', 'Tazi',
     '2016-06-08',
     '2026-10-31',
     5),

    ('Mehdi', 'Tazi',
     '2012-12-22',
     NULL,
     5);


-- ============================================================
-- 5. ACTIVITIES
-- ============================================================

INSERT INTO activities (
    name,
    description,
    facility_id,
    club_id,
    max_capacity,
    price,
    age_min,
    age_max,
    day_of_week,
    start_time,
    end_time
)
VALUES

    (
        'Football U12',
        'Entraînement de football pour jeunes.',
        1,
        1,
        25,
        300.00,
        8,
        12,
        'Monday',
        '16:00',
        '17:30'
    ),

    (
        'Basketball Jeunes',
        'Initiation et entraînement au basketball.',
        1,
        1,
        20,
        280.00,
        10,
        16,
        'Tuesday',
        '17:00',
        '18:30'
    ),

    (
        'Natation Enfants',
        'Cours de natation pour enfants.',
        2,
        2,
        15,
        350.00,
        6,
        12,
        'Wednesday',
        '15:00',
        '16:00'
    ),

    (
        'Natation Adultes',
        'Cours de natation pour adultes.',
        2,
        2,
        20,
        400.00,
        18,
        60,
        'Thursday',
        '18:00',
        '19:30'
    ),

    (
        'Judo Débutants',
        'Initiation au judo pour débutants.',
        3,
        3,
        15,
        250.00,
        7,
        14,
        'Friday',
        '16:00',
        '17:30'
    ),

    (
        'Athlétisme Jeunes',
        'Entraînement général d’athlétisme.',
        4,
        1,
        30,
        220.00,
        10,
        18,
        'Saturday',
        '09:00',
        '10:30'
    );


-- ============================================================
-- 6. REGISTRATIONS
-- ============================================================

INSERT INTO registrations (
    member_id,
    activity_id,
    registration_date,
    status,
    final_price
)
VALUES
    (
        1,
        1,
        CURRENT_TIMESTAMP,
        'confirmed',
        300.00
    ),

    (
        2,
        1,
        CURRENT_TIMESTAMP,
        'confirmed',
        255.00
    ),

    (
        3,
        2,
        CURRENT_TIMESTAMP,
        'confirmed',
        280.00
    ),

    (
        4,
        3,
        CURRENT_TIMESTAMP,
        'confirmed',
        297.50
    ),

    (
        5,
        5,
        CURRENT_TIMESTAMP,
        'confirmed',
        250.00
    );


-- ============================================================
-- 7. WAITING LIST
-- ============================================================

INSERT INTO waiting_list (
    member_id,
    activity_id,
    position,
    created_at,
    status
)
VALUES
    (
        6,
        1,
        1,
        CURRENT_TIMESTAMP,
        'waiting'
    ),

    (
        7,
        3,
        1,
        CURRENT_TIMESTAMP,
        'waiting'
    ),

    (
        8,
        3,
        2,
        CURRENT_TIMESTAMP,
        'waiting'
    );