# 🔧 Troubleshooting Guide - FlowGrid ERP

## ❌ Login Failed / Connection Error

### Symptom
- Login page shows "Login failed" or "Connection Error"
- Red banner saying "Backend Server Offline"

### Cause
Backend server is not running

### Solution
```bash
# Open a new terminal
cd server
npm run dev

# You should see:
# ✅ MongoDB connected successfully
# 🚀 Server running on port 5000
```

### Verify
Open http://localhost:5000/health in your browser
Should see: `{"status":"ok","timestamp":"..."}`

---

## ❌ MongoDB Connection Failed

### Symptom
Backend terminal shows:
```
❌ MongoDB connection error
```

### Cause
MongoDB is not running

### Solution

**Windows:**
```cmd
net start MongoDB
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### Verify
```bash
mongosh
# Should connect without errors
```

---

## ❌ Port Already in Use

### Symptom
```
Error: listen EADDRINUSE: address already in use :::5000
```
or
```
Port 8081 is in use
```

### Solution

**Kill Process on Port 5000 (Backend):**

Windows:
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

macOS/Linux:
```bash
lsof -ti:5000 | xargs kill -9
```

**Kill Process on Port 8081 (Frontend):**

Windows:
```cmd
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

macOS/Linux:
```bash
lsof -ti:8081 | xargs kill -9
```

---

## ❌ Database Not Seeded

### Symptom
- Login works but dashboard is empty
- No data showing

### Solution
```bash
npm run server:seed
```

### Verify
```bash
mongosh flowgrid
db.users.countDocuments()
# Should return: 5
```

---

## ❌ CORS Error

### Symptom
Browser console shows:
```
Access to fetch at 'http://localhost:5000/api/...' from origin 'http://localhost:8081' has been blocked by CORS policy
```

### Cause
Backend CORS_ORIGIN doesn't match frontend URL

### Solution
Check `server/.env`:
```env
CORS_ORIGIN=http://localhost:8081
```

Restart backend server after changing.

---

## ❌ Token Expired / Invalid

### Symptom
- Logged in but getting 401 errors
- "Invalid or expired token"

### Solution
1. Logout
2. Clear browser localStorage (F12 → Application → Local Storage → Clear)
3. Login again

Or just:
```javascript
// In browser console (F12)
localStorage.clear();
location.reload();
```

---

## ❌ Frontend Not Loading

### Symptom
- http://localhost:8081 doesn't load
- "This site can't be reached"

### Cause
Frontend server not running

### Solution
```bash
npm run dev
```

Should see:
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:8081/
```

---

## ❌ Backend Dependencies Missing

### Symptom
```
Error: Cannot find module 'express'
```

### Solution
```bash
cd server
npm install
cd ..
```

---

## ❌ Frontend Dependencies Missing

### Symptom
```
Error: Cannot find module '@/components/...'
```

### Solution
```bash
npm install
```

---

## 🧪 Test Backend Connection

Run this command to test if backend is working:

```bash
node test-connection.js
```

This will tell you exactly what's wrong:
- ✅ Health check working
- ✅ Login endpoint working
- ❌ Connection failed (server not running)
- ❌ Login failed (database not seeded)

---

## 🔍 Check What's Running

### Check if Backend is Running
```bash
# Windows
netstat -ano | findstr :5000

# macOS/Linux
lsof -i:5000
```

### Check if Frontend is Running
```bash
# Windows
netstat -ano | findstr :8081

# macOS/Linux
lsof -i:8081
```

### Check if MongoDB is Running
```bash
mongosh
# If it connects, MongoDB is running
```

---

## 📋 Complete Restart Procedure

If everything is broken, start fresh:

### 1. Stop Everything
```bash
# Kill all Node processes
# Windows: taskkill /F /IM node.exe
# macOS/Linux: killall node
```

### 2. Start MongoDB
```bash
# Windows: net start MongoDB
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### 3. Start Backend
```bash
cd server
npm run dev
# Wait for "Server running on port 5000"
```

### 4. Start Frontend (New Terminal)
```bash
npm run dev
# Wait for "Local: http://localhost:8081/"
```

### 5. Test
- Open http://localhost:5000/health (should see JSON)
- Open http://localhost:8081 (should see login page)
- Login with admin@flowgrid.com / admin123

---

## 🐛 Still Not Working?

### Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Common errors:
   - `Failed to fetch` → Backend not running
   - `CORS error` → Check CORS_ORIGIN in server/.env
   - `401 Unauthorized` → Token expired, logout and login again

### Check Backend Terminal
Look for errors in the terminal where backend is running:
- `EADDRINUSE` → Port already in use
- `MongooseError` → MongoDB connection issue
- `TypeError` → Code error (check recent changes)

### Check Frontend Terminal
Look for errors in the terminal where frontend is running:
- `EADDRINUSE` → Port already in use
- `Module not found` → Run `npm install`
- TypeScript errors → Run `npm run typecheck`

---

## 📞 Quick Diagnostic Checklist

Run through this checklist:

- [ ] MongoDB is running (`mongosh` connects)
- [ ] Backend server is running (terminal shows "Server running on port 5000")
- [ ] Frontend server is running (terminal shows "Local: http://localhost:8081/")
- [ ] http://localhost:5000/health returns JSON
- [ ] http://localhost:8081 shows login page
- [ ] Database is seeded (`mongosh flowgrid` → `db.users.countDocuments()` returns 5)
- [ ] No CORS errors in browser console
- [ ] Login page shows green "Backend Connected" banner

If all checked, login should work!

---

## 🆘 Emergency Reset

If nothing works, nuclear option:

```bash
# 1. Stop everything
# Kill all node processes

# 2. Clean install
rm -rf node_modules server/node_modules
npm install
cd server && npm install && cd ..

# 3. Reset database
mongosh flowgrid --eval "db.dropDatabase()"
npm run server:seed

# 4. Start fresh
# Terminal 1: cd server && npm run dev
# Terminal 2: npm run dev
```

---

## 💡 Pro Tips

1. **Always check both terminals** - You need both servers running
2. **Use the test script** - `node test-connection.js` tells you exactly what's wrong
3. **Check the login page** - Green banner = backend connected, Red banner = backend offline
4. **Browser console is your friend** - F12 shows all errors
5. **When in doubt, restart** - Stop both servers and start again

---

**Most common issue: Forgetting to start the backend server!** 🎯
