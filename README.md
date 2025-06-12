# Torn City API Monitor

A comprehensive monitoring tool for Torn City game data, built with React, TypeScript, and Bun.

## Features

- Real-time monitoring of Torn City user statuses
- Hospital monitoring system
- AI-powered monitoring dashboard
- Levelling list tracking
- User account statistics
- Dark/Light theme support
- Responsive design

## Tech Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **Backend**: Bun, Hono
- **Database**: Turso
- **State Management**: Zustand
- **Routing**: TanStack Router
- **Styling**: TailwindCSS, shadcn/ui
- **Authentication**: Better Auth

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- Bun (latest version)
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/torn-api-monitor.git
cd torn-api-monitor
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
```bash
cp apps/server/.env.example apps/server/.env
```
Edit the `.env` file with your Torn API key and other configuration.

4. Start the development server:
```bash
bun run dev
```

The application will be available at:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000

## Project Structure

```
├── apps/
│   ├── web/           # Frontend application
│   └── server/        # Backend application
├── packages/          # Shared packages
├── .gitignore
├── package.json
├── README.md
└── turbo.json
```

## Available Scripts

- `bun run dev` - Start development servers
- `bun run build` - Build for production
- `bun run start` - Start production servers
- `bun run lint` - Run linting
- `bun run test` - Run tests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Torn City API for providing the data
- All contributors who have helped with the project
