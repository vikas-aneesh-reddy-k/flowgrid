# Quick Build and Deploy Guide

## Current Configuration
- **New EC2 IP:** 13.51.176.153
- **Frontend API Path:** `/api` (relative, proxied by nginx)
- **Backend Port:** 5000 (internal only, not exposed)
- **Frontend Port:** 80 (public)

## Step 1: Build and Push Docker Images

Run this script to build and push the frontend:

```bash
./rebuild-frontend.sh
```

Or manually:

```bash
# Build frontend with relative API path
docker build --build-arg VITE_API_URL=/api -f Dockerfile.frontend -t vikaskakarla/flowgrid-frontend:latest .

# Push to Docker Hub
docker push vikaskakarla/flowgrid-frontend:latest
```

If you also need to rebuild the backend:

```bash
cd server
docker build -t vikaskakarla/flowgrid-backend:latest .
docker push vikaskakarla/flowgrid-backend:latest
cd ..
```

## Step 2: Deploy on EC2

SSH into your EC2 instance:

```bash
ssh -i flowgrid.pem ubuntu@13.51.176.153
```

Then run:

```bash
cd /home/ubuntu/flowgrid

# Pull latest images
docker-compose pull

# Restart services
docker-compose down
docker-compose up -d

# Check status
docker-compose ps

# View logs (optional)
docker-compose logs -f
```

## Step 3: Verify

1. **Open in browser:** http://13.51.176.153

2. **Test API in browser console (F12):**
   ```javascript
   fetch('/api/health').then(r => r.json()).then(console.log)
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

3. **Test authentication:**
   - Register a new user
   - Login
   - Check browser console for errors

## Troubleshooting

### If frontend still shows old IP errors:

```bash
# On EC2, force rebuild frontend
docker-compose pull frontend
docker-compose up -d --force-recreate frontend
docker-compose logs frontend
```

### If backend has CORS errors:

```bash
# On EC2, check .env file
cat /home/ubuntu/flowgrid/.env

# Should show: CORS_ORIGIN=http://13.51.176.153
# If not, edit it:
nano /home/ubuntu/flowgrid/.env

# Then restart backend
docker-compose restart backend
```

### View all logs:

```bash
docker-compose logs -f
```

### Check individual service:

```bash
docker-compose logs frontend
docker-compose logs backend
docker-compose logs mongodb
```

## What Changed

1. ✅ Updated `.env.production` with new IP: `13.51.176.153`
2. ✅ Frontend now uses `/api` instead of hardcoded IP
3. ✅ Updated `rebuild-frontend.sh` to auto-push to Docker Hub
4. ✅ Updated documentation with new IP
5. ✅ Pushed all changes to GitHub

## Architecture

```
User Browser
    ↓
http://13.51.176.153 (port 80)
    ↓
Nginx Container (Frontend)
    ↓ /api/* requests proxied to →
Backend Container (port 5000, internal)
    ↓
MongoDB Container (port 27017, internal)
```

## Important Notes

- ✅ Only port 80 is exposed to internet (secure)
- ✅ Backend port 5000 is internal only
- ✅ No hardcoded IPs in frontend code
- ✅ CORS configured for new IP
- ✅ All changes committed and pushed to GitHub

## Next Steps

After successful deployment:
1. Test all features thoroughly
2. Monitor logs for any issues
3. Consider setting up SSL/HTTPS
4. Set up automated backups
5. Configure monitoring/alerting
