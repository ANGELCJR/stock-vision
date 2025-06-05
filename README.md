# Stock Portfolio Analytics Platform

A comprehensive stock market analysis platform built with React, TypeScript, Node.js, and PostgreSQL.

## Features

- Real-time portfolio tracking and management
- Live market news with sentiment analysis
- Interactive performance charts and analytics
- User profile management with persistent data
- Responsive design with dark theme

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **APIs**: NewsAPI for financial news, Alpha Vantage for market data

## Environment Variables

Create a `.env` file with:

```
DATABASE_URL=your_postgresql_database_url
NEWS_API_KEY=your_newsapi_key
ALPHAVANTAGE_API_KEY=your_alphavantage_key
```

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Push database schema: `npm run db:push`
5. Start development: `npm run dev`

## Deployment

- **Build**: `npm run build`
- **Start**: `npm run start`

## Live Demo

[Add your deployed URL here]