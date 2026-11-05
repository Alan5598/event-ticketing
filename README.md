# EventQ

EventQ is an event discovery and ticketing platform that connects event organizers with attendees. It is designed to support the event lifecycle from discovery and organizer onboarding through ticket management and event-day check-in.

## Platform features

### Event discovery

- Browse and find events by category, location, and search terms.
- Explore event details, schedules, venue information, and frequently asked questions.
- Get assistance finding events and answers to common event questions.

### Attendee experience

- Create an account and manage a personal profile.
- Discover events and keep track of event registrations and tickets.
- Access digital tickets for event check-in.

### Organizer experience

- Apply to become an organizer and manage an organizer profile.
- Create, update, publish, and cancel events.
- Set event capacity and ticket options.
- Review event activity and support attendees.

### Administration

- Review organizer applications and approve or reject them.
- Help maintain a trusted event marketplace.

## Technology

EventQ is developed with a modular architecture intended to support a web application and API services. The current backend uses Node.js, Express, TypeScript, MongoDB, and Mongoose. API documentation is available through Swagger when running the backend.

## Getting started

For local development, install the dependencies in the project directory and configure the required environment variables using the project’s `.env.example` file. Keep local credentials in `.env` and do not commit them.

```bash
npm install
cp .env.example .env
npm run dev
```

In PowerShell, copy the example configuration with:

```powershell
Copy-Item .env.example .env
```

The backend runs on port `5000` by default, configurable through `PORT`. Its Swagger UI is available at `/api/docs`.
