# HealthyMeal

A web application that helps users adapt recipes to their specific dietary needs through AI-powered customization.

## Table of Contents

- [Project Description](#project-description)
- [Tech Stack](#tech-stack)
- [Getting Started Locally](#getting-started-locally)
- [Available Scripts](#available-scripts)
- [Project Scope](#project-scope)
- [Project Status](#project-status)
- [License](#license)

## Project Description

HealthyMeal is a web application designed to solve the challenge of customizing recipes to individual dietary needs. The platform enables users to save their own recipes and modify them using artificial intelligence (AI) according to their nutritional preferences and dietary restrictions.

The primary target audience is individuals with carbohydrate metabolism issues, particularly those with insulin resistance and type 2 diabetes. HealthyMeal helps them safely enjoy their favorite recipes by automatically adjusting ingredients and proportions to meet their health requirements.

The application uses the Claude 3 Sonnet AI model to analyze recipes and suggest changes that align with user preferences, such as carbohydrate restrictions, allergen exclusions, or adherence to specific diet types.

### Key Features

- User account management with dietary preference settings
- Recipe management (add, view, edit, delete)
- AI-powered recipe modification
- Side-by-side comparison of original and modified recipes
- User dashboard with personalized content
- Recipe printing functionality

## Tech Stack

### Frontend
- React.js - core UI library
- React Context API with hooks for state management
- Material-UI or Chakra UI - component library
- React Router - navigation
- Formik with Yup - form management and validation

### Backend
- Node.js with Express.js - REST API framework
- JWT (JSON Web Tokens) - authentication
- Joi or Express-validator - input validation
- Custom middleware for error handling and logging

### Database
- MongoDB - NoSQL database
- Mongoose - ODM (Object Data Modeling)
- MongoDB Atlas - cloud database hosting

### AI Integration
- Claude API or OpenAI API - for recipe modifications
- Middleware layer for API communication
- Caching similar queries to limit API calls
- User daily query limits (5 per day)

### Deployment & DevOps
- Frontend: Vercel or Netlify
- Backend: Render, Railway or similar PaaS
- CI/CD: GitHub Actions
- Error monitoring: Sentry

### Testing
- End-to-End: Selenium WebDriver
- Testing framework: Mocha + Chai
- Unit tests: Jest

## Getting Started Locally

### Prerequisites

- Node.js version specified in `.nvmrc`
- MongoDB installed locally or MongoDB Atlas account
- AI API access (Claude or OpenAI)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/healthymeal.git
   cd healthymeal
   ```

2. Use the correct Node.js version
   ```bash
   nvm use
   ```

3. Install dependencies for both frontend and backend
   ```bash
   # Install frontend dependencies
   cd frontend
   npm install
   
   # Install backend dependencies
   cd ../backend
   npm install
   ```

4. Set up environment variables
   ```bash
   # In the backend directory, create a .env file
   cp .env.example .env
   
   # Edit the .env file with your MongoDB URI, JWT secret, and AI API keys
   ```

5. Start development servers
   ```bash
   # Start backend server (from backend directory)
   npm run dev
   
   # In a new terminal, start frontend server (from frontend directory)
   npm start
   ```

6. The application should now be running:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## Available Scripts

### Frontend

- `npm start` - Starts the development server
- `npm build` - Builds the app for production
- `npm test` - Runs the test suite
- `npm run eject` - Ejects from create-react-app

### Backend

- `npm run dev` - Starts the server with hot-reload for development
- `npm start` - Starts the server for production
- `npm test` - Runs the test suite
- `npm run build` - Compiles TypeScript to JavaScript

## Project Scope

### MVP Features

The Minimum Viable Product includes:

- User authentication and profile management
- Recipe CRUD operations
- AI-based recipe modification
- User dashboard with personalized content
- Error reporting system
- Recipe printing functionality

### Out of Scope for MVP

The following features are not included in the initial release:

- Recipe import from URLs
- Multimedia support (recipe photos, instructional videos)
- Social features (sharing, comments, likes)
- Mobile application (web version only)
- Integration with external nutritional databases
- Recipe rating/review system
- Automatic verification of AI-generated recipes
- Third-party authentication (Google, Facebook)
- Advanced ingredient and nutritional analysis

## Project Status

The project is currently in the development phase with a 6-week timeline for MVP delivery. The implementation follows a phased approach:

1. Basic infrastructure (1 week)
2. Authentication and account management (1 week)
3. Recipe management (2 weeks)
4. AI integration (1 week)
5. Finalization and testing (1 week)

## License

This project is licensed under the MIT License - see the LICENSE file for details.

---

© 2023 HealthyMeal. All rights reserved.