# Smart Academic Support System

A full-stack academic support platform for students and library administrators. The system combines digital library management, personalized recommendations, AI-assisted learning roadmaps, progress tracking, study circles, peer-to-peer book sharing, notifications, and admin analytics in one web application.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Demo Credentials](#demo-credentials)
- [Available Scripts](#available-scripts)
- [API Overview](#api-overview)
- [AI Support](#ai-support)
- [Troubleshooting](#troubleshooting)

## Overview

Smart Academic Support System helps students discover books, request issues, reserve unavailable titles, receive personalized suggestions, generate skill roadmaps, track learning progress, collaborate with peers, and exchange books through a campus-focused P2P hub.

Administrators can manage inventory, approve or reject issue requests, track overdue books, monitor reservations, and view operational reports.

## Key Features

### Student Features

- Secure registration and login with JWT authentication
- Student dashboard with academic and library activity summary
- Search books by keyword, category, topic, author, and availability
- View book details, ratings, reviews, and availability status
- Request book issue, return, renewal, and reservation
- Personalized book recommendations based on interests, history, ratings, authors, and topics
- AI-assisted skill roadmap generator with beginner, intermediate, and advanced stages
- Progress tracker for roadmap milestones
- Study circle discovery, joining, messaging, and shared resource voting
- Peer-to-peer book sharing through a shadow library module
- Notifications for issue, reservation, and system updates
- Student profile management

### Admin Features

- Admin dashboard with library statistics
- Add, edit, delete, and manage books
- Manage issue requests, approvals, rejections, returns, and renewals
- Track overdue books
- Manage student reservations
- Generate reports for total books, issued books, overdue books, active students, popular books, and pending requests

### AI and Learning Features

- AI chat assistant for library and study-related questions
- Roadmap generation for requested skills or subjects
- Personalized recommendation insights
- Works even without AI API keys using curated fallback logic

## Tech Stack

### Frontend

- React 18
- Vite
- Tailwind CSS
- React Router DOM
- lucide-react
- Recharts

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs password hashing
- OpenAI or Gemini integration with fallback support

## Project Structure

```txt
smart-academic-support-system/
  backend/
    src/
      config/          MongoDB connection
      controllers/     Route handlers and business logic
      middleware/      Auth and error middleware
      models/          Mongoose schemas
      routes/          Express API routes
      seed/            Demo data seed scripts
      utils/           Token, AI, and helper utilities
      server.js        Express app entry point
    .env.example
    package.json

  frontend/
    src/
      api/             API client
      components/      Reusable UI components
      context/         Auth context
      layouts/         Dashboard layout
      pages/           App pages
      utils/           Formatting helpers
      App.jsx          Route definitions
      main.jsx         React entry point
    .env.example
    index.html
    package.json
    tailwind.config.js
    vite.config.js
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm
- MongoDB running locally or a MongoDB Atlas connection string

### 1. Clone or Open the Project

```bash
cd smart-academic-support-system
```

### 2. Configure the Backend

```bash
cd backend
npm install
cp .env.example .env
```

Update `.env` if required.

```txt
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/smart-academic-support-system
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
```

Seed the database with demo users, books, requests, notifications, roadmaps, and P2P data:

```bash
npm run seed
```

Start the backend:

```bash
npm run dev
```

The API runs at:

```txt
http://localhost:5000
```

### 3. Configure the Frontend

Open a second terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

Frontend `.env`:

```txt
VITE_API_URL=http://localhost:5000/api
```

Start the frontend:

```bash
npm run dev
```

Open:

```txt
http://localhost:5173
```

## Environment Variables

### Backend

| Variable | Required | Description |
| --- | --- | --- |
| `PORT` | No | Backend server port. Defaults to `5000`. |
| `MONGO_URI` | Yes | MongoDB connection string. |
| `JWT_SECRET` | Yes | Secret used to sign JWT tokens. |
| `JWT_EXPIRES_IN` | No | Token lifetime, for example `7d`. |
| `CLIENT_URL` | No | Frontend URL allowed by CORS. |
| `OPENAI_API_KEY` | No | Enables OpenAI-powered AI features. |
| `OPENAI_MODEL` | No | OpenAI model name. |
| `GEMINI_API_KEY` | No | Enables Gemini fallback AI features. |
| `GEMINI_MODEL` | No | Gemini model name. |

### Frontend

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_URL` | Yes | Backend API base URL. |

## Demo Credentials

### Student

```txt
Email: student@sass.edu
Password: student123
```

### Admin

```txt
Email: admin@sass.edu
Password: admin123
```

Run `npm run seed` inside `backend` before using these accounts.

## Available Scripts

### Backend

```bash
npm run dev      # Start backend with nodemon
npm start        # Start backend with node
npm run seed     # Reset and seed demo data
```

### Frontend

```bash
npm run dev      # Start Vite development server
npm run build    # Create production build
npm run preview  # Preview production build locally
```

## API Overview

Base URL:

```txt
http://localhost:5000/api
```

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`

### Books

- `GET /books`
- `GET /books/:id`
- `POST /books`
- `PUT /books/:id`
- `DELETE /books/:id`
- `POST /books/:id/rate`

### Issues and Returns

- `POST /issues/request`
- `GET /issues/my`
- `GET /issues/all`
- `PATCH /issues/:id/approve`
- `PATCH /issues/:id/reject`
- `PATCH /issues/:id/return`
- `PATCH /issues/:id/renew`

### Reservations

- `POST /reservations`
- `GET /reservations/my`
- `GET /reservations/all`

### Recommendations

- `GET /recommendations/books`

### Roadmaps

- `POST /roadmaps/generate`
- `GET /roadmaps/my`
- `PATCH /roadmaps/:id/progress`

### Notifications

- `GET /notifications`
- `PATCH /notifications/:id/read`

### Reports

- `GET /reports/admin`

### AI

- `POST /ai/chat`
- `GET /ai/status`

### Study Circles

- `GET /study-circles/peers`
- `GET /study-circles`
- `POST /study-circles`
- `POST /study-circles/:id/join`
- `GET /study-circles/:id/messages`
- `POST /study-circles/:id/messages`
- `GET /study-circles/resources/:skill`
- `POST /study-circles/resources`
- `POST /study-circles/resources/:id/vote`

### Peer-to-Peer Books

- `GET /p2p/books`
- `GET /p2p/my-books`
- `POST /p2p/books`
- `DELETE /p2p/books/:id`
- `POST /p2p/requests`
- `GET /p2p/requests/incoming`
- `GET /p2p/requests/outgoing`
- `PATCH /p2p/requests/:id/:action`

## AI Support

The backend uses AI providers in this order:

1. OpenAI, when `OPENAI_API_KEY` is configured
2. Gemini, when `GEMINI_API_KEY` is configured
3. Curated static fallback logic when no provider is configured or a provider request fails

This means the application remains usable during demos even without external AI credentials.

## Troubleshooting

### MongoDB connection failed

Make sure MongoDB is running locally or replace `MONGO_URI` with a valid MongoDB Atlas URI.

### Frontend cannot reach backend

Check that:

- Backend is running on `http://localhost:5000`
- Frontend `.env` has `VITE_API_URL=http://localhost:5000/api`
- Backend `.env` has `CLIENT_URL=http://localhost:5173`

### Demo login does not work

Run the seed script again:

```bash
cd backend
npm run seed
```

### AI responses are generic

Add at least one AI provider key in `backend/.env`. The app intentionally falls back to curated responses when no key is present.

## License

This project was built for academic and hackathon use.
