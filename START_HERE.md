# 🚀 START HERE - FlowGrid ERP

## ⚠️ IMPORTANT: You Need BOTH Servers Running!

FlowGrid is a **full-stack application** that requires:
1. **Backend Server** (Node.js API on port 5000)
2. **Frontend Server** (React app on port 8081)

---

## 🎯 Quick Start (3 Steps)

### Step 1: Install Dependencies (First Time Only)
```bash
npm install
npm run server:install
```

### Step 2: Seed Database (First Time Only)
```bash
# Make sure MongoDB is running first!
npm run server:seed
```

### Step 3: Start BOTH Servers

#### Option A: Automatic (Recommended)
```bash
# Windows
start.bat

# macOS/Linux
./start.sh
```

#### Option B: Manual (Two Terminals)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

---

## 🌐 Access the Application

Once both servers are running:

- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/health

---

## 🔐 Login Credentials

```
Email:    admin@flowgrid.com
Password: admin123
```

Other test accounts:
- sales@flowgrid.com / sales123
- hr@flowgrid.com / hr123456
- inventory@flowgrid.com / inventory123

---

## ❌ Common Issues

### "Login failed" or "Connection Error"

**Problem:** Backend server is not running

**Solution:**
```bash
# Check if backend is running
# You should see: "Server running on port 5000"

# If not, start it:
cd server
npm run dev
```

### "MongoDB connection failed"

**Problem:** MongoDB is not running

**Solution:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl start mongod

# Test connection
mongosh
```

### Port Already in Use

**Problem:** Port 5000 or 8081 is already in use

**Solution:**
```bash
# Windows - Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux - Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

---

## ✅ Verify Everything is Working

### 1. Check Backend
Open: http://localhost:5000/health

Should see:
```json
{
  "status": "ok",
  "timestamp": "2025-11-10T..."
}
```

### 2. Check Frontend
Open: http://localhost:8081

Should see the login page

### 3. Test Login
1. Go to http://localhost:8081
2. Click "Fill Demo Credentials"
3. Click "Sign in"
4. Should redirect to dashboard

---

## 📊 What You Should See

### Backend Terminal:
```
✅ MongoDB connected successfully
📊 Database: flowgrid
🚀 Server running on port 5000
📍 Environment: development
🌐 CORS enabled for: http://localhost:8081
```

### Frontend Terminal:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:8081/
➜  Network: use --host to expose
```

---

## 🎉 You're Ready!

Once you see both servers running and can login, you're all set!

**Next Steps:**
1. Explore the dashboard
2. Check out different modules (CRM, Inventory, etc.)
3. Try the API endpoints
4. Start customizing

---

## 📚 More Help

- **Quick Start**: GETTING_STARTED.md
- **Detailed Setup**: README_SETUP.md
- **Full Documentation**: DEPLOYMENT.md
- **API Reference**: See DEPLOYMENT.md

---

## 🆘 Still Having Issues?

1. Make sure MongoDB is running
2. Make sure both servers are running
3. Check browser console for errors (F12)
4. Check server terminal for errors
5. Try restarting both servers

**Test Backend Connection:**
```bash
node test-connection.js
```

This will tell you exactly what's wrong!

**For detailed solutions, see:** [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

---

**Remember: You need BOTH servers running at the same time!** 🚀
