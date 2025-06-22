# Waste2Give - Food Rescue Platform

A platform connecting businesses with excess food to shelters and food banks.

## Setup Instructions

1. Install all dependencies:
   ```bash
   npm run install:all
   ```

2. Start the development environment:
   ```bash
   npm run dev
   ```

This will start both the frontend (React) and backend (Express) servers.

- Frontend: http://localhost:5173
- Backend: http://localhost:3000

## API Endpoints

- POST `/api/donations` - Create a new donation
- GET `/api/donations` - Get all available donations
- POST `/api/donations/claim` - Claim an existing donation
- GET `/api/users/:id/history` - Get a user's donation history
- POST `/api/ai/impact` - Get an impact message for pounds saved

## Project Structure

- `/frontend` - React frontend with TailwindCSS
- `/server` - Express API server

## Features

- Donate excess food items
- Browse available donations
- Claim donations
- View impact metrics and statistics
- User dashboard with history

## Environment Variables

Copy `.env.example` to `.env` in the server directory and configure:
- PORT - Server port (default: 3000)
- GEMINI_API_KEY - (Optional) For better impact messages

## Technologies

- Frontend: React, TailwindCSS, Vite
- Backend: Node.js, Express
- API: RESTful endpoints