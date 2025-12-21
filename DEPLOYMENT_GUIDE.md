# TIET Medicare Deployment Guide

## Quick Deployment Steps

### Prerequisites
- GitHub account
- MongoDB Atlas account (free tier available)
- Render account (for backend)
- Vercel or Netlify account (for frontend)

---

## Step 1: Setup MongoDB Atlas (Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Create a database user with password
4. Whitelist all IPs: `0.0.0.0/0` (for Render access)
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/tiet-medicare?retryWrites=true&w=majority
   ```

---

## Step 2: Deploy Backend to Render

1. Go to [Render](https://render.com) and sign up
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `tiet-medicare-api`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`

5. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | Generate a strong 32+ character secret |
   | `JWT_EXPIRE` | `30d` |
   | `ALLOWED_ORIGINS` | Your frontend URL (add after deploying frontend) |

6. Click "Create Web Service"
7. Wait for deployment (takes 5-10 minutes)
8. Note your backend URL: `https://your-app.onrender.com`

---

## Step 3: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com) and sign up
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add Environment Variables:
   | Key | Value |
   |-----|-------|
   | `VITE_API_URL` | `https://your-backend.onrender.com` |
   | `VITE_SOCKET_URL` | `https://your-backend.onrender.com` |

6. Click "Deploy"
7. Note your frontend URL: `https://your-app.vercel.app`

---

## Step 4: Update CORS (Important!)

Go back to Render and update the `ALLOWED_ORIGINS` environment variable:
```
https://your-app.vercel.app
```

Redeploy the backend for changes to take effect.

---

## Alternative: Deploy Frontend to Netlify

1. Go to [Netlify](https://netlify.com) and sign up
2. Click "Add new site" → "Import an existing project"
3. Connect GitHub and select your repository
4. Configure:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/dist`

5. Add Environment Variables in Site Settings:
   - `VITE_API_URL`: Your Render backend URL
   - `VITE_SOCKET_URL`: Your Render backend URL

---

## Environment Variables Summary

### Backend (Render)
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-super-secret-key-at-least-32-chars
JWT_EXPIRE=30d
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

### Frontend (Vercel/Netlify)
```env
VITE_API_URL=https://your-backend.onrender.com
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

## Troubleshooting

### Backend not starting
- Check Render logs for errors
- Verify MongoDB connection string is correct
- Ensure all required env variables are set

### CORS errors
- Update `ALLOWED_ORIGINS` in Render to include your frontend URL
- Redeploy backend after changing env variables

### Socket.IO not connecting
- Ensure `VITE_SOCKET_URL` matches your backend URL
- Check browser console for WebSocket errors

### Database connection issues
- Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access
- Verify username/password in connection string

---

## Free Tier Limitations

### Render (Free)
- Spins down after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- 750 hours/month

### Vercel (Free)
- 100GB bandwidth/month
- Serverless function limits apply

### MongoDB Atlas (Free)
- 512MB storage
- Shared cluster

---

## Production Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with strong password
- [ ] IP whitelist configured (0.0.0.0/0)
- [ ] Backend deployed to Render
- [ ] All backend env variables set
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Frontend env variables set
- [ ] CORS origins updated in backend
- [ ] Test login/signup functionality
- [ ] Test real-time chat (Socket.IO)
- [ ] Test appointment booking

## Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Git

## Local Development Setup

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/tiet-medicare
   JWT_SECRET=your_secure_jwt_secret_here
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Update `.env` with backend URL:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## Production Deployment

### Option 1: Traditional VPS/Server Deployment

#### Backend Deployment
1. Clone repository on server:
   ```bash
   git clone <your-repo-url>
   cd tiet-medicare/backend
   ```

2. Install dependencies:
   ```bash
   npm ci --production
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with production values
   ```

4. Install PM2 for process management:
   ```bash
   npm install -g pm2
   ```

5. Start application with PM2:
   ```bash
   pm2 start server.js --name "tiet-medicare-api"
   pm2 startup
   pm2 save
   ```

#### Frontend Deployment
1. Build the frontend:
   ```bash
   cd frontend
   npm ci
   npm run build
   ```

2. Serve with nginx or Apache:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           root /path/to/frontend/dist;
           try_files $uri $uri/ /index.html;
       }
       
       location /api {
           proxy_pass http://localhost:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

### Option 2: Docker Deployment

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as build

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6
    container_name: tiet-medicare-db
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password
    volumes:
      - mongodb_data:/data/db
    ports:
      - "27017:27017"

  backend:
    build: ./backend
    container_name: tiet-medicare-api
    restart: unless-stopped
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://admin:password@mongodb:27017/tiet-medicare?authSource=admin
      JWT_SECRET: your_production_jwt_secret
    ports:
      - "5000:5000"
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    container_name: tiet-medicare-web
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongodb_data:
```

### Option 3: Cloud Platform Deployment

#### Heroku Deployment
1. Install Heroku CLI
2. Create Heroku apps:
   ```bash
   heroku create tiet-medicare-api
   heroku create tiet-medicare-web
   ```

3. Set environment variables:
   ```bash
   heroku config:set NODE_ENV=production -a tiet-medicare-api
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri -a tiet-medicare-api
   heroku config:set JWT_SECRET=your_jwt_secret -a tiet-medicare-api
   ```

4. Deploy backend:
   ```bash
   cd backend
   git subtree push --prefix=backend heroku main
   ```

#### Vercel Deployment (Frontend)
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy frontend:
   ```bash
   cd frontend
   vercel --prod
   ```

#### Railway Deployment
1. Connect GitHub repository to Railway
2. Set environment variables in Railway dashboard
3. Deploy with automatic builds

## Database Setup

### MongoDB Atlas (Recommended for Production)
1. Create MongoDB Atlas account
2. Create new cluster
3. Set up database user and network access
4. Get connection string
5. Update MONGODB_URI in environment variables

### Local MongoDB
1. Install MongoDB Community Server
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

## Environment Variables

### Backend (.env)
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/tiet-medicare
JWT_SECRET=your_very_secure_jwt_secret_at_least_32_characters
JWT_EXPIRE=30d
ALLOWED_ORIGINS=https://your-frontend-domain.com
```

### Frontend (.env)
```env
VITE_API_URL=https://your-backend-domain.com
```

## SSL/HTTPS Setup

### Using Let's Encrypt with Certbot
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Using Cloudflare
1. Add domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption

## Monitoring and Logging

### PM2 Monitoring
```bash
pm2 monit
pm2 logs tiet-medicare-api
```

### Log Rotation
```bash
pm2 install pm2-logrotate
```

### Health Checks
Set up monitoring for:
- `/api/health` endpoint
- Database connectivity
- Memory and CPU usage

## Backup Strategy

### Database Backup
```bash
# MongoDB dump
mongodump --uri="your_mongodb_uri" --out=/backup/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="/backup/$DATE"
find /backup -type d -mtime +7 -exec rm -rf {} \;
```

### File Backup
- Set up regular backups of uploaded files
- Use cloud storage for redundancy

## Security Checklist

- [ ] Use HTTPS in production
- [ ] Set secure JWT secret (32+ characters)
- [ ] Enable MongoDB authentication
- [ ] Configure firewall rules
- [ ] Set up rate limiting
- [ ] Enable CORS properly
- [ ] Use environment variables for secrets
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities

## Performance Optimization

### Backend
- Enable gzip compression
- Use Redis for session storage
- Implement database indexing
- Set up connection pooling

### Frontend
- Enable code splitting
- Optimize images
- Use CDN for static assets
- Implement caching strategies

## Troubleshooting

### Common Issues
1. **Database connection failed**
   - Check MongoDB URI
   - Verify network access
   - Check authentication credentials

2. **CORS errors**
   - Update ALLOWED_ORIGINS
   - Check frontend URL configuration

3. **JWT token issues**
   - Verify JWT_SECRET matches
   - Check token expiration

4. **Build failures**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility

### Logs Location
- PM2 logs: `~/.pm2/logs/`
- Application logs: Check console output
- Nginx logs: `/var/log/nginx/`