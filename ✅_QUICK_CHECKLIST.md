# ✅ QUICK DEPLOYMENT CHECKLIST

## 📋 30-Minute Setup

### ☐ STEP 1: EC2 Setup (5 min)

```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP

# Run this:
curl -fsSL https://get.docker.com -o get-docker.sh && \
sudo sh get-docker.sh && \
sudo usermod -aG docker ubuntu && \
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose && \
sudo chmod +x /usr/local/bin/docker-compose && \
mkdir -p /home/ubuntu/flowgrid

exit
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
```

**My EC2 IP:** ___________________

---

### ☐ STEP 2: Generate JWT Secret (2 min)

**PowerShell:**
```powershell
$bytes = New-Object byte[] 32
[Security.Cryptography.RNGCryptoServiceProvider]::Create().GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

**My JWT Secret:** ___________________

---

### ☐ STEP 3: Add GitHub Secrets (10 min)

Go to: `https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions`

Add these 6 secrets:

- [ ] `EC2_HOST` = Your EC2 IP
- [ ] `EC2_USER` = `ubuntu`
- [ ] `EC2_SSH_KEY` = Your entire .pem file content
- [ ] `REPO_URL` = `https://github.com/YOUR_USERNAME/YOUR_REPO.git`
- [ ] `MONGO_PASSWORD` = `admin123`
- [ ] `JWT_SECRET` = Generated secret

---

### ☐ STEP 4: Deploy (1 min)

```bash
git add .
git commit -m "Deploy with Docker"
git push origin main
```

---

### ☐ STEP 5: Verify (5 min)

- [ ] GitHub Actions completed successfully
- [ ] SSH to EC2: `docker ps` shows 3 containers
- [ ] Frontend works: `http://YOUR_EC2_IP`
- [ ] API works: `http://YOUR_EC2_IP/api/health`
- [ ] Seed database: `docker exec -it flowgrid-backend sh -c "cd /app && node dist/scripts/seed.js"`

---

## ✅ Success Criteria

- [ ] 3 containers running (frontend, backend, mongodb)
- [ ] Frontend accessible
- [ ] API responding
- [ ] Database connected
- [ ] Auto-deployment working

---

## 🎯 Quick Commands

### Check Status
```bash
ssh -i "your-key.pem" ubuntu@YOUR_EC2_IP
docker ps
```

### View Logs
```bash
docker logs flowgrid-backend -f
```

### Restart
```bash
cd /home/ubuntu/flowgrid
docker-compose restart
```

---

## 🎉 DONE!

**Time:** 30 minutes
**Cost:** ~$7.50/month
**Complexity:** Minimal
**Backend:** ✅ Fully working
**Database:** ✅ Fully integrated
**Auto-deploy:** ✅ On every push

---

**Follow: 🎯_YOUR_SIMPLE_GUIDE.md for detailed steps!**
