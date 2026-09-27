# 🏟️ Sconnect Pro

> Sports & Associative Management Platform

Sconnect Pro is a web application for managing municipal sports facilities, clubs, activities, members, registrations, pricing, schedules and waiting lists. It is built with native Node.js HTTP, EJS and PostgreSQL.

## Features

- Facilities and clubs: create, view, update and delete
- Activities: create and list, with schedule-collision and ERP-capacity checks
- Members: create, view, update and delete; associate members with families
- Registrations: eligibility checks, pricing, capacity checks and transactional insertion
- Waiting list: resident priority, cancellation-triggered promotion and a 48-hour confirmation deadline
- Checkout: server-calculated quote, dynamic price preview and three-payment breakdown
- Dashboard: occupancy and revenue analytics
- Custom EJS 404 page

**Implementation note:** Some features and mandatory tests are still being finalized, including high-risk medical-certificate rules, automatic execution of expired waiting-list promotions, client-side validation and print styles.

## Tech stack

- **Backend:** Node.js native `http`, `find-my-way`, `pg`, `dotenv`
- **Frontend:** EJS, HTML, CSS, vanilla JavaScript
- **Database:** PostgreSQL
- **Planning:** Jira and Notion

No Express framework or ORM is used.

## Business rules

### Pricing

Rules are applied in this order:

1. Resident: base price; non-resident: **+35%**.
2. Family registration: first **0%**, second **−15%**, third and subsequent **−30%**.
3. Family quotient: below 600 **−40%**; 600–900 **−20%**; above 900 **0%**.
4. Pass'Sport: **−€50** when applicable.
5. Minimum final price: **€15**.

Three-payment option: **40% / 30% / 30%**, with cent-accurate rounding of the final installment.

The browser provides a price preview. The server recalculates the authoritative price.

### Scheduling

An activity is rejected when its schedule overlaps another activity in the same facility or its capacity exceeds the facility's ERP capacity. Two time ranges overlap when:

```text
existing.start_time < new.end_time
AND existing.end_time > new.start_time
```

### Eligibility

Age is evaluated at the end of the calendar year. Expired medical documentation may result in an administrative registration with `medical_non_compliant` status. The project brief additionally requires specific certificate-validity rules for high-risk sports (boxing, diving and rugby); these still require final verification and testing.

### Registrations and waiting list

Registration uses a PostgreSQL transaction and `SELECT ... FOR UPDATE` on the activity row to prevent concurrent overbooking. When an activity is full, a candidate joins its waiting list. Residents receive a priority score of **+10**. Cancellation can promote the next candidate to `promoted_pending` with a **48-hour** confirmation deadline. The expiration-processing function must be invoked by an application workflow or scheduled process to run automatically.

## Project structure

```text
Sconnect-Pro/
├── database/
│   ├── schema.sql
│   ├── seeds.sql
│   └── queries_analytics.sql
├── public/
│   ├── css/
│   │   ├── style.css
│   │   └── print.css                 # planned
│   ├── js/
│   │   ├── dynamic-pricing.js
│   │   └── client-validation.js     # planned
│   └── images/
├── src/
│   ├── config/db.js
│   ├── services/
│   │   ├── pricingService.js
│   │   ├── scheduleService.js
│   │   ├── eligibilityService.js
│   │   └── waitingListService.js
│   └── controllers/
│       ├── homeController.js
│       ├── facilityController.js
│       ├── clubController.js
│       ├── activityController.js
│       ├── memberController.js
│       ├── checkoutController.js
│       └── registrationController.js
├── views/
│   ├── partials/
│   └── pages/
│       ├── dashboard.ejs
│       ├── facilities.ejs
│       ├── clubs.ejs
│       ├── activities.ejs
│       ├── members.ejs
│       ├── checkout.ejs
│       ├── registrations.ejs
│       └── error.ejs
├── .env.example
├── .gitignore
├── package.json
└── server.js
```

The structure above reflects the implementation discussed so far; confirm it against the repository before publishing.

## Database

PostgreSQL database: `sconnect_pro`.

Main tables: `facilities`, `clubs`, `activities`, `families`, `members`, `registrations`, `waiting_list`.

SQL files:

- `database/schema.sql`: database schema
- `database/seeds.sql`: sample data
- `database/queries_analytics.sql`: occupancy and revenue queries

## Installation

### Prerequisites

- Node.js and npm
- PostgreSQL

### 1. Clone and install

```bash
git clone <YOUR_REPOSITORY_URL>
cd Sconnect-Pro
npm install
```

Replace `<YOUR_REPOSITORY_URL>` with the actual GitHub URL.

### 2. Create and populate the database

```bash
createdb -U <DB_USER> sconnect_pro
psql -U <DB_USER> -d sconnect_pro -f database/schema.sql
psql -U <DB_USER> -d sconnect_pro -f database/seeds.sql
```

Use a PostgreSQL role that has permission to create the database and its schema.

### 3. Configure environment

Create `.env` (do not commit it):

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sconnect_pro
DB_USER=your_db_user
DB_PASSWORD=your_db_password
PORT=3000
```

Make sure the variable names match `src/config/db.js` in your checkout.

### 4. Start

```bash
node server.js
```

Open `http://localhost:3000`. If you configured the local hostname, you can use `http://mocro.mern:3000`.

## Routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/` | Dashboard |
| GET | `/facilities` | List facilities |
| POST | `/facilities` | Create facility |
| POST | `/facilities/update` | Update facility |
| POST | `/facilities/delete` | Delete facility |
| GET | `/clubs` | List clubs |
| POST | `/clubs` | Create club |
| POST | `/clubs/update` | Update club |
| POST | `/clubs/delete` | Delete club |
| GET | `/activities` | List activities |
| POST | `/activities` | Create activity |
| GET | `/members` | List members |
| POST | `/members` | Create member |
| POST | `/members/update` | Update member |
| POST | `/members/delete` | Delete member |
| GET | `/checkout` | Display checkout |
| POST | `/checkout` | Calculate quote |
| GET | `/registrations` | List registrations |
| POST | `/registrations` | Register or waitlist a member |
| POST | `/registrations/cancel` | Cancel registration |

## Security and concurrency

- Use parameterized SQL (`$1`, `$2`, etc.) for user-supplied values.
- Use EJS escaped interpolation (`<%= value %>`) for user-controlled text.
- Keep secrets out of Git using `.env` and `.gitignore`.
- Wrap registration and cancellation changes in transactions; use row locks where concurrent changes could conflict.
- Browser-side pricing is a preview only; verify all business rules on the server.

## Mandatory test checklist

- [ ] TC-01 Server startup
- [ ] TC-02 Static CSS and `text/css` content type
- [ ] TC-03 Unknown URL renders `error.ejs` with 404
- [ ] TC-04 Valid activity schedule
- [ ] TC-05 Overlapping schedule rejected
- [ ] TC-06 ERP capacity enforced
- [ ] TC-07 Eligible age accepted
- [ ] TC-08 Ineligible age rejected
- [ ] TC-09 General medical-certificate validity
- [ ] TC-10 High-risk medical-certificate rule
- [ ] TC-11 Resident base price
- [ ] TC-12 Non-resident +35%
- [ ] TC-13 Second family registration −15%
- [ ] TC-14 Third family registration −30%
- [ ] TC-15 Family quotient below 600 −40%
- [ ] TC-16 Pass'Sport −€50 and €15 floor
- [ ] TC-17 Three payments with exact cent handling
- [ ] TC-18 Full activity creates waiting-list entry
- [ ] TC-19 Resident priority +10
- [ ] TC-20 Cancellation promotes next candidate
- [ ] TC-21 Confirmation deadline H+48
- [ ] TC-22 Concurrent requests do not overbook
- [ ] TC-23 XSS-safe rendering
- [ ] TC-24 SQL injection protection
- [ ] TC-25 Database outage returns 500 without crashing server

Check off each item only after it has been tested successfully.

## Remaining work

- Complete and test high-risk medical-certificate rules.
- Verify the full waiting-list lifecycle, including expired promotions and candidate confirmation.
- Finish client-side validation and print styles.
- Run the full TC-01–TC-25 test plan.
- Verify mobile responsiveness and complete mockups.
- Review the Jira board and GitHub commit history.
- Optional: provide a Docker image.

## Deliverables

- GitHub repository and source code
- PostgreSQL schema, seeds and analytics queries
- Simple UI mockups
- README
- Jira project plan
- Optional Docker image

## Author

**Khalil El Qaddabi**  
Full Stack Development Student — YouCode