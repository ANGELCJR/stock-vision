# External Deployment Guide

## Quick Setup Steps

### 1. Download Project
- In Replit: Three dots menu → "Download as zip"
- Extract to your computer

### 2. Setup GitHub Repository
```bash
git init
git add .
git commit -m "Stock Portfolio Platform - Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/stock-portfolio.git
git push -u origin main
```

### 3. Deploy to Vercel
1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click "New Project" → Import your repository
3. Configure:
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Root Directory: `./`

### 4. Environment Variables (Critical)
Add these in Vercel dashboard under Settings → Environment Variables:

```
DATABASE_URL=postgresql://username:password@host:port/database
NEWS_API_KEY=your_newsapi_key_here
ALPHAVANTAGE_API_KEY=your_alphavantage_key_here
NODE_ENV=production
```

### 5. Database Setup
**Option A: Neon (Recommended - Free PostgreSQL)**
1. Go to [neon.tech](https://neon.tech) → Create account
2. Create new project → Copy connection string
3. Use this as your DATABASE_URL

**Option B: Supabase**
1. Go to [supabase.com](https://supabase.com) → Create project
2. Settings → Database → Copy URI
3. Use this as your DATABASE_URL

### 6. Custom Domain (Optional)
1. Buy domain from Namecheap/GoDaddy (~$12/year)
2. In Vercel: Settings → Domains → Add domain
3. Update DNS as instructed

## Alternative: Railway (Easier Full-Stack)
1. Go to [railway.app](https://railway.app)
2. Connect GitHub repository
3. Add PostgreSQL service
4. Deploy automatically

## Resume Addition
```
Stock Portfolio Analytics Platform | [your-domain.com]
React • TypeScript • Node.js • PostgreSQL • Tailwind CSS

• Built comprehensive financial platform with real-time market data integration
• Implemented user authentication, portfolio tracking, and news sentiment analysis  
• Deployed full-stack application with custom domain and production database
• GitHub: github.com/yourusername/stock-portfolio
```