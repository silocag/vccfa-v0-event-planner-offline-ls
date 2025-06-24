# EventPlanner

**EventPlanner** is a collaborative, offline-first event planning tool designed to help groups organize events seamlessly. It allows users to manage guests, propose and vote on event details like dates and locations, and plan activities, all with robust offline capabilities.

## Features

*   **User Authentication:** Secure login and registration, with a convenient quick demo login for prototyping.
*   **Event Management:** Create new events with titles, descriptions, and flexible date ranges.
*   **Guest & Group Management:**
    *   Add, remove, and rename guests.
    *   Organize guests into custom groups (e.g., "Marketing Team," "Family").
    *   Assign roles like "Organizer" and "Group Admin" to guests.
    *   Drag-and-drop functionality to assign guests to groups.
*   **Guest Preferences:** Capture detailed guest preferences including room and bed types, children's beds, animal allowances, food preferences, and general notes.
*   **Collaborative Voting:**
    *   Propose and vote on preferred days, locations, and accommodations.
    *   Calendar view for day voting, showing availability at a glance.
    *   Summaries of votes for each option.
    *   Ability for organizers to lock/unlock voting for specific categories.
    *   Mark "agreed" days, locations, and accommodations.
*   **Accommodation Planning:**
    *   Define detailed accommodation options with multiple rooms and beds.
    *   Assign guests to specific beds using an intuitive drag-and-drop interface.
    *   Track guest preferences against assigned beds for easy fulfillment.
*   **Activity Planning:**
    *   Add, edit, and delete event activities with dates and times.
    *   Assign specific guests to activities.
    *   Alerts for activities scheduled on non-agreed days.
*   **Event Overview:** A dashboard providing a quick summary of event details, agreed items, guest count, and activity count.
*   **Share Event:** Easily share event links with guests.
*   **Offline-First:** Data is persisted locally using `localStorage`, ensuring a smooth experience even without an internet connection.

## Future Steps

To evolve EventPlanner into a production-ready application, the following integrations are recommended:

*   **Authentication:** Replace the current `localStorage`-based authentication with a robust solution like [Supabase Auth](https://supabase.com/docs/guides/auth) to handle user sign-ups, logins, and session management securely.
*   **Persistence:** Transition from `localStorage` to a scalable database solution for persistent data storage. Options include:
    *   **Supabase:** A powerful open-source Firebase alternative offering a PostgreSQL database, real-time subscriptions, and more.
    *   **Neon:** A serverless PostgreSQL database that scales on demand.
    *   **Upstash:** A serverless data platform providing Redis and Kafka, suitable for caching or real-time features.
*   **AI Features:** Explore integrating AI models using the [AI SDK](https://sdk.vercel.ai/) to enhance event planning, such as:
    *   Suggesting activity ideas based on event type and guest preferences.
    *   Optimizing room assignments based on guest preferences and available beds.
    *   Generating personalized itineraries for guests.
