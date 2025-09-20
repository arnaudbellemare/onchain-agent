# Production Deployment Guide

This guide will help you deploy the Onchain Agent API to production with Supabase self-hosted database.

## Prerequisites

- Node.js 18+ installed
- Supabase account and project
- Domain name for your API
- SSL certificate (or use a service like Vercel/Netlify)

## Step 1: Environment Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env.production
   ```

2. **Configure environment variables:**
   ```bash
   # Required
   NODE_ENV=production
   NEXTAUTH_SECRET=your-super-secure-secret-key-here
   NEXTAUTH_URL=https://your-domain.com
   
   # Supabase Configuration
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   
   # Database
   DATABASE_ENABLED=true
   DATABASE_URL=postgresql://postgres:password@localhost:5432/onchain_agent
   
   # API Security
   API_KEY_ENCRYPTION_KEY=your-32-character-encryption-key-here!
   
   # AI Provider Keys (Optional)
   OPENAI_API_KEY=your-openai-key
   ANTHROPIC_API_KEY=your-anthropic-key
   PERPLEXITY_API_KEY=your-perplexity-key
   ```

## Step 2: Supabase Database Setup

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema:**
   - Open your Supabase project dashboard
   - Go to SQL Editor
   - Copy and paste the contents of `supabase-schema.sql`
   - Execute the SQL

3. **Configure Row Level Security (RLS):**
   - The schema includes RLS policies
   - Enable RLS in Supabase dashboard if not already enabled

## Step 3: API Testing

1. **Quick test (basic functionality):**
   ```bash
   npm run test:quick
   ```

2. **Comprehensive test (all endpoints):**
   ```bash
   npm run test:api
   ```

3. **Production readiness check:**
   ```bash
   npm run test:production
   ```

## Step 4: Build and Deploy

### Option A: Vercel (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set environment variables in Vercel dashboard**

### Option B: Docker

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   RUN npm run build
   
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

2. **Build and run:**
   ```bash
   docker build -t onchain-agent .
   docker run -p 3000:3000 --env-file .env.production onchain-agent
   ```

### Option C: Traditional Server

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   NODE_ENV=production npm start
   ```

## Step 5: Data Migration (If Applicable)

If you have existing in-memory API keys:

1. **Run migration script:**
   ```bash
   npm run migrate
   ```

2. **Verify migration:**
   - Check Supabase dashboard for migrated data
   - Test API key authentication

## Step 6: Production Verification

1. **Health check:**
   ```bash
   curl https://your-domain.com/api/health
   ```

2. **API key generation test:**
   ```bash
   curl -X POST https://your-domain.com/api/v1/keys/initial \
     -H "Content-Type: application/json" \
     -d '{"name": "Production Test Key", "permissions": ["read", "write"]}'
   ```

3. **API key validation test:**
   ```bash
   curl https://your-domain.com/api/v1?action=info \
     -H "Authorization: Bearer YOUR_API_KEY"
   ```

## Step 7: Monitoring and Maintenance

### Health Monitoring

- Set up uptime monitoring for `/api/health`
- Monitor response times and error rates
- Set up alerts for critical issues

### Database Maintenance

- Monitor database connection pool
- Set up automated backups
- Monitor query performance

### Security

- Regularly rotate API keys
- Monitor for suspicious activity
- Keep dependencies updated

## API Endpoints Overview

### Core Endpoints

- `GET /api/health` - Health check
- `POST /api/v1/keys/initial` - Generate initial API key
- `GET /api/v1?action=info` - API information
- `POST /api/v1` - Main API endpoint (optimization)

### Demo Endpoints

- `GET /api/cost-aware-optimization` - Cost optimization demo
- `GET /api/comprehensive-optimizer` - Comprehensive optimizer demo
- `GET /api/capo-x402-demo` - CAPO x402 demo
- `GET /api/real-x402-demo` - Real x402 protocol demo

## Troubleshooting

### Common Issues

1. **Database connection failed:**
   - Check DATABASE_URL format
   - Verify Supabase credentials
   - Check network connectivity

2. **API key validation failing:**
   - Verify API_KEY_ENCRYPTION_KEY is set
   - Check key format (should start with 'oa_' or 'ak_')
   - Ensure key is not expired

3. **CORS issues:**
   - Configure CORS in next.config.ts
   - Check domain whitelist

4. **Rate limiting issues:**
   - Adjust rate limits in configuration
   - Check for DDoS protection conflicts

### Debug Mode

Enable debug logging:
```bash
DEBUG=* npm start
```

## Security Checklist

- [ ] Environment variables secured
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] Rate limiting enabled
- [ ] API key encryption configured
- [ ] Database RLS enabled
- [ ] Security headers configured
- [ ] Dependencies updated
- [ ] Secrets rotated regularly

## Performance Optimization

1. **Enable caching:**
   - Configure Redis for session storage
   - Enable API response caching

2. **Database optimization:**
   - Add appropriate indexes
   - Optimize queries
   - Monitor connection pool

3. **CDN setup:**
   - Use CDN for static assets
   - Configure caching headers

## Support

For issues and support:
- Check the logs first
- Run the test suites
- Review the troubleshooting section
- Check GitHub issues

## Next Steps

After successful deployment:

1. Set up monitoring and alerting
2. Configure automated backups
3. Set up CI/CD pipeline
4. Plan for scaling
5. Document API usage for your team
