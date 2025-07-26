# SafariCAD

A professional CAD application designed for safari and wildlife design projects.

## Features

- User authentication and project management
- Interactive CAD drawing interface
- Project collaboration
- Drawing version control
- SQLite database for data persistence

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation and Setup

1. **Install all dependencies:**
   ```bash
   npm run install-all
   ```

2. **Initialize the database:**
   ```bash
   npm run init-db
   ```

3. **Start both frontend and backend:**
   ```bash
   npm start
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

### Demo Login

Use these credentials to log in:
- Username: `admin`
- Password: `password`

## Project Structure

```
safaricad/
├── backend/           # Node.js/Express API server
│   ├── server.js      # Main server file
│   ├── scripts/       # Database initialization scripts
│   └── package.json   # Backend dependencies
├── frontend/          # React frontend application
│   ├── src/           # React source code
│   ├── public/        # Static files
│   └── package.json   # Frontend dependencies
├── database/          # Database files and schemas
│   ├── safaricad.sql  # Database schema
│   └── safaricad.db   # SQLite database (created after init)
└── package.json       # Root package.json with scripts
```

## Development

### Running in Development Mode

```bash
npm run dev
```

This starts both backend and frontend in development mode with hot reloading.

### Individual Commands

- Start backend only: `npm run start:backend`
- Start frontend only: `npm run start:frontend`
- Initialize database: `npm run init-db`

## API Endpoints

- `POST /api/auth/login` - User authentication
- `GET /api/projects` - Get user projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id/drawings` - Get project drawings
- `POST /api/projects/:id/drawings` - Create new drawing

## Technologies Used

### Backend
- Node.js
- Express.js
- SQLite3
- JWT for authentication
- bcrypt for password hashing

### Frontend
- React 18
- Material-UI (MUI)
- React Router
- Konva.js for CAD canvas
- Axios for API calls

## License

MIT License
