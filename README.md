# EventQ — Smart Event Ticketing & Intelligent Discovery Platform

EventQ is a modern, full-stack event marketplace platform designed to bridge the gap between event organizers and attendees. The platform handles the entire event lifecycle: from seamless vendor onboarding and secure ticket generation to real-time QR-code validation at the door and an embedded AI event assistant.

---

## Core Platform Workflows

The system architecture is built around three distinct user roles, ensuring a secure and tailored experience for everyone interacting with the platform:

### 1. Visitor Experiences (Unauthenticated)
* **Discovery Feed:** Anyone can browse the marketplace for upcoming, published events using natural language search terms.
* **AI Event Finder:** A smart homepage assistant that parses natural search queries (e.g., "Tech meetups in Kigali next week") and recommends matches based on active database listings.
* **Event Q&A Box:** Visitors can ask hyper-specific questions on individual event pages. The AI answers using strictly verified organizer details without guessing.

### 2. Attendee Management
* **Instant Onboarding:** Quick account creation that defaults to standard consumer privileges.
* **Secure Registration:** One-click registration for event vouchers and passes.
* **Digital Ticket Wallet:** Access to a personalized "My Tickets" area displaying secure, non-duplicable QR code credentials.

### 3. Organizer Utilities & Governance
* **Event Creation Suite:** Creators can build and manage event listings, adjust capacities, set up ticket tiers, and provide specialized scheduling details.
* **Admin Approval Queue:** To ensure marketplace safety, new organizers complete a verification profile reviewed by system administrators before gaining full hosting permissions.
* **Gate Validation App:** A built-in, phone-camera-powered scanner page that instantly decodes QR tokens, cross-checks event ownership, and blocks duplicate scan attempts.
* **Resolution Hub:** A dedicated dashboard for organizers to track attendance numbers and manually answer fallback questions passed over by the AI assistant.

---

## System Engineering & Stack

The platform is designed around strict professional engineering patterns to ensure high performance, security, and a modular layout:

* **Frontend Layer:** Component-driven user interfaces that handle responsive state switching between attendee profiles and organizer dashboards.
* **Backend API Engine:** Built using Node.js, Express, and strict TypeScript configurations following a modular Controller-Service architecture.
* **Database Platform:** Programmed using a code-first MongoDB and Mongoose infrastructure, leveraging high-speed indexing for live transaction counts and inventory locks.
* **Isolated Artificial Intelligence:** Large Language Model (LLM) processing loops run entirely in server memory. The AI engine is denied direct database read/write access to maintain information integrity.

---

## Local Development Configuration

### Environment Setup
To configure the system components locally, create your local configuration settings file from the provided blueprint:
```bash
cp .env .env.example
```

Open the newly generated `.env.example` file to populate your specific database string references, application ports, and secure system keys:

---

## Team Collaboration & Git Branching Rules
* All development work is handled inside isolated branches named `feature/short-name`.
* Direct pushes to the production `main` branch are blocked by repository constraints.
* Every pull request must be reviewed and formally approved by at least one teammate before code is integrated.
