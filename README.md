CloudVibe: Weather Insights & Social Vibes

CloudVibe is a multi-user weather dashboard application built to provide real-time weather data, personalized AI-driven insights, and a community "vibe check" for travelers and locals alike.

Project Overview
CloudVibe fulfills the core requirements of the Trao Full-Stack Engineering Assessment by providing secure authentication, multi-city management, and persistent user-specific favorites. It goes beyond the basics with an integrated AI agent for weather summarization and a custom social feature for real-time local feedback.

Live Demo Link - https://cloudy-ai-weather-application.vercel.app/

Tech Stack & Justification
For this project, I utilized the Preferred Tech Stack as it perfectly aligns with modern production standards for scalability and performance:

Frontend: Next.js 16 (App Router) + Tailwind CSS 
Reasoning: Next.js provides excellent SEO, server-side rendering for fast initial loads, and built-in API routing.

Backend: Next.js API Routes (Node.js environment) 
Reasoning: Using Next.js as a unified framework allows for seamless type sharing and simpler deployment on Vercel.

Database: MongoDB (via Mongoose) 
Reasoning: NoSQL is ideal for the flexible structure of weather data and user-specific favorite lists.

Authentication: JWT (JSON Web Tokens) with HTTP-Only Cookies 
Reasoning: Ensures secure, stateless session management with strict data isolation.

External API: OpenWeatherMap API , Gemini

High-Level Architecture
The application follows a Clean Architecture pattern, separating concerns between the database layer, API logic, and client-side components.
Data Isolation: All database queries are scoped by userId extracted from verified JWT tokens, ensuring users cannot access or modify others' data.
Middleware (Proxy): A custom proxy.js (middleware) handles edge-level authorization, redirecting unauthenticated users away from protected dashboard features.
Global State: React hooks (useState, useEffect, useCallback) manage real-time UI updates across the dashboard.

Authentication & Authorization
Approach: Secure registration and login using hashed passwords (Bcrypt) and JWT tokens.
Persistence: Tokens are stored in httpOnly cookies to prevent XSS attacks.
Route Protection: The /api/auth/me endpoint serves as the source of truth for the frontend isLoggedIn state, ensuring a smooth and secure user experience.

AI Agent Design & Purpose
Feature: AI Weather Strategist 
Purpose: To transform raw data (temp, humidity, wind) into human-relatable insights.
Design: Utilizing an AI agent, the system analyzes the current OpenWeather data to answer the question: "What does this weather actually feel like?" 
Value: It helps users make decisions (e.g., "Perfect for a light jacket" vs. "Stay indoors") rather than just reading numbers.

Creative Custom Feature: "Public Vibe Check"
What it is: A real-time, location-based social feed.
The Problem: Weather APIs tell you the temperature, but they don't tell you the vibe (e.g., "The park is currently very crowded" or "The wind is making the cafe umbrellas fly away").
The Solution: A localized comment section where users share short "vibes" (max 50 words).
Engineering Judgment: To keep the data fresh, I implemented a 24-hour TTL (Time To Live) logic—comments older than one day are automatically filtered out to ensure users only see today's weather vibes.

Setup Instructions
Local Development
Clone the repo: git clone https://github.com/[your-username]/cloudvibe.git
cd cloudvibe

Install dependencies: npm install

Environment Variables: Create a .env file in the root:

MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_random_secret_string
OPENWEATHER_API_KEY=your_api_key
GEMINI_API_KEY=your_gemini_api_key
NODE_ENV=production_or_dev_depending_on_environment

Run the app: npm run dev
Open http://localhost:3000 to view the app.

Deployment (Vercel)
This application is optimized for Vercel:
Connect your GitHub repository to Vercel.
Configure the environment variables in the Vercel Dashboard.

The src/lib/mongodb.js is configured with a global cache to handle serverless connection limits.

Known Limitations
API Rate Limits: The free tier of OpenWeatherMap may limit heavy concurrent usage.
Search Scope: The AI summary is currently limited to the 24-hour forecast context.
