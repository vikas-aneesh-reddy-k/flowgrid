# Quick Fix for EC2 Connection Timeout

## Problem
Frontend was trying to connect to the old IP `http://16.170.155.235:5000` but the new EC2 IP is `13.51.176.153`.

## Solution: Rebuild Frontend with Relative API Path

The frontend should use nginx as a proxy (`/api`) instead of connecting directly to an IP address and port 5000.

**On your local machine:**

```bash
# Build and push with correct API URL
./rebuild-frontend.sh
```

Or manually:

```bash
# Build with correct API URL
docker build --build-arg VITE_API_URL=/api -f Dockerfile.frontend -t vikaskakarla/flowgrid-frontend:latest .

# Push to Docker Hub
docker push vikaskakarla/flowgrid-frontend:latest
```

**On EC2 (13.51.176.153):**

```bash
# Pull new image
docker-compose pull frontend

# Restart frontend
docker-compose up -d frontend

# Verify
docker-compose ps
```

**Why this approach:**
- Only port 80 needs to be open (more secure)
- Nginx handles all routing
- Backend is not exposed directly
- No hardcoded IPs in frontend code
- Standard production setup

---

## Verify It's Working

After the fix, test in browser console:
```javascript
fetch('/api/health').then(r => r.json()).then(console.log)
```

Should return: `{"status":"ok","timestamp":"..."}`
