# Deployment Guide for New EC2 IP: 13.51.176.153

## Overview
This guide covers updating the FlowGrid application to work with the new EC2 instance at IP `13.51.176.153`.

## Changes Made

### 1. Environment Configuration
- Updated `.env.production` with new IP: `CORS_ORIGIN=http://13.51.176.153`

### 2. Build Configuration
- Frontend uses relative API path `/api` instead of hardcoded IP
- Nginx proxies `/api` requests to backend service
- No direct connection to port 5000 from browser

## Deployment Steps

### Step 1: Build and Push Docker Images

On your local machine:

```bash
# Build and push frontend
./rebuild-frontend.sh

# Or manually:
docker build --build-arg VITE_API_URL=/api -f Dockerfile.frontend -t vikaskakarla/flowgrid-frontend:latest .
docker push vikaskakarla/flowgrid-frontend:latest

# Build and push backend (if needed)
cd server
docker build -t vikaskakarla/flowgrid-backend:latest .
docker push vikaskakarla/flowgrid-backend:latest
```

### Step 2: Update EC2 Instance

SSH into your EC2 instance:

```bash
ssh -i flowgrid.pem ubuntu@13.51.176.153
```

Navigate to application directory and update `.env`:

```bash
cd /home/ubuntu/flowgrid
nano .env
```

Ensure `.env` contains:

```env
# MongoDB Configuration
MONGO_USER=admin
MONGO_PASSWORD=FlowGrid2024SecurePassword!

# JWT Configuration
JWT_SECRET=FlowGrid2024SuperSecureJWTSecretKey123456789!

# Node Environment
NODE_ENV=production

# CORS Origin
CORS_ORIGIN=http://13.51.176.153
```

### Step 3: Pull and Restart Services

```bash
# Pull latest images
docker-compose pull

# Restart all services
docker-compose down
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

### Step 4: Verify Deployment

1. **Check services are running:**
   ```bash
   docker-compose ps
   ```
   All services should show "Up" status.

2. **Test backend health:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

3. **Test from browser:**
   - Open: http://13.51.176.153
   - Open browser console (F12)
   - Run: `fetch('/api/health').then(r => r.json()).then(console.log)`
   - Should return health status

4. **Test authentication:**
   - Try to register a new user
   - Try to login
   - Check browser console for any errors

## Security Group Configuration

Ensure your EC2 security group has these inbound rules:

| Type | Protocol | Port | Source | Description |
|------|----------|------|--------|-------------|
| HTTP | TCP | 80 | 0.0.0.0/0 | Frontend access |
| SSH | TCP | 22 | Your IP | SSH access |

**Note:** Port 5000 should NOT be open to the internet. The backend is accessed through nginx proxy on port 80.

## Troubleshooting

### Frontend shows connection errors
```bash
# Check frontend logs
docker-compose logs frontend

# Rebuild and restart frontend
docker-compose pull frontend
docker-compose up -d frontend
```

### Backend not responding
```bash
# Check backend logs
docker-compose logs backend

# Check if MongoDB is running
docker-compose logs mongodb

# Restart backend
docker-compose restart backend
```

### CORS errors
- Verify `.env` has correct `CORS_ORIGIN=http://13.51.176.153`
- Restart backend: `docker-compose restart backend`

### MongoDB connection issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

## Architecture

```
Browser (http://13.51.176.153)
    ↓
Nginx (port 80) - Frontend
    ↓ /api/* requests
Backend (port 5000) - Internal only
    ↓
MongoDB (port 27017) - Internal only
```

## Important Notes

1. **No Hardcoded IPs:** Frontend uses relative path `/api` which nginx proxies to backend
2. **Single Port:** Only port 80 is exposed to internet
3. **Internal Communication:** Backend and MongoDB communicate on Docker network
4. **CORS:** Backend validates requests from `http://13.51.176.153`

## Next Steps After Deployment

1. Test all features (login, register, employee management)
2. Monitor logs for any errors
3. Set up automated backups for MongoDB
4. Consider setting up SSL/HTTPS with Let's Encrypt
5. Set up monitoring and alerting

## Rollback Procedure

If something goes wrong:

```bash
# Stop services
docker-compose down

# Pull previous version (if tagged)
docker pull vikaskakarla/flowgrid-frontend:previous
docker pull vikaskakarla/flowgrid-backend:previous

# Update docker-compose.yml to use :previous tag
# Then restart
docker-compose up -d
```
