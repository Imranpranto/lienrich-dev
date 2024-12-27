# Project Bolt

A powerful SaaS platform for managing and analyzing LinkedIn engagement, built with React, TypeScript, and Supabase.

## Features

- **User Authentication**: Secure email/password and social login with profile management
- **Lead Management**: Create and manage audiences, save leads, and track engagement
- **HubSpot Integration**: Seamless data synchronization with HubSpot CRM
- **Webhook Support**: Configure custom webhooks for real-time data updates
- **Analytics**: Track engagement metrics and profile completion
- **Search Capabilities**: Advanced search for people and companies
- **Credit System**: Managed usage through a credit-based system

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication)
- **Integrations**: HubSpot API, LinkedIn API
- **Build Tools**: Vite
- **Package Manager**: npm

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
project/
├── src/
│   ├── components/     # React components
│   ├── contexts/       # React contexts
│   ├── hooks/         # Custom React hooks
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── types/         # TypeScript types
│   └── utils/         # Utility functions
├── database/          # Database migrations
└── public/           # Static assets
```

## Key Components

- **UserProfile**: User profile management with avatar and display name
- **LeadsTable**: Display and manage saved leads
- **HubSpotIntegration**: Configure and manage HubSpot sync
- **WebhookConfig**: Set up and manage webhooks
- **SearchPeopleTable**: Advanced people search functionality

## Database

The application uses Supabase (PostgreSQL) with several key tables:
- Profiles
- Audiences
- Leads
- Webhooks
- HubSpot configuration

Database migrations are managed through SQL files in the `database/migrations` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is proprietary software. All rights reserved.
