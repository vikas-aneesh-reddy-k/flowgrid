# 🎯 Deployment Checklist

Use this checklist to ensure everything is configured correctly before deploying.

## ✅ Pre-Deployment Checklist

### 1. AWS EC2 Setup
- [ ] EC2 instance launched (Ubuntu 22.04, t2.medium or larger)
- [ ] Security Group configured:
  - [ ] Port 22 (SSH) - Your IP
  - [ ] Port 80 (HTTP) - 0.0.0.0/0
  - [ ] Port 5000 (API) - 0.0.0.0/0
  - [ ] Port 27017 (MongoDB) - Your IP only
- [ ] .pem key file downloaded and saved securely
- [ ] EC2 public IP noted: `_________________`

### 2. Docker Hub Setup
- [ ] Docker Hub account created
- [ ] Access token generated at https://hub.docker.com/settings/security
- [ ] Token saved securely: `_________________`

### 3. GitHub Repository
- [ ] Code pushed to GitHub
- [ ] Repository URL: `_________________`
- [ ] Main branch name confirmed (main or master)

### 4. GitHub Secrets Configured
Go to: Settings → Secrets and variables → Actions

- [ ] `DOCKER_USERNAME` = `vikaskakarla`
- [ ] `DOCKER_PASSWORD` = Your Docker Hub token
- [ ] `EC2_HOST` = Your EC2 public IP
- [ ] `EC2_USERNAME` = `ubuntu`
- [ ] `EC2_SSH_KEY` = Full content of .pem file
- [ ] `VITE_API_URL` = `http://YOUR_EC2_IP:5000/api`

### 5. EC2 Initial Setup
- [ ] Connected to EC2 via SSH
- [ ] Ran `setup-ec2.sh` script
- [ ] Docker installed and running
- [ ] `/home/ubuntu/flowgrid` directory created
- [ ] `.env` file created and configured
- [ ] `CORS_ORIGIN` updated with EC2 IP in `.env`
- [ ] `docker-compose.yml` copied to EC2

### 6. Local Testing (Optional but Recommended)
- [ ] Ran `deploy/test-local.bat` (Windows) or `deploy/test-local.sh` (Mac/Linux)
- [ ] All builds passed successfully
- [ ] No Docker errors

## 🚀 Deployment Steps

### Step 1: Push to GitHub
```bash
git add .
git commit -m "Setup CI/CD deployment"
git push origin main
```
- [ ] Code pushed successfully
- [ ] No git errors

### Step 2: Monitor GitHub Actions
- [ ] Go to GitHub → Actions tab
- [ ] Workflow started automatically
- [ ] Build backend job completed
- [ ] Build frontend job completed
- [ ] Deploy to EC2 job completed
- [ ] No errors in logs

### Step 3: Verify Deployment on EC2
SSH into EC2 and run:
```bash
cd /home/ubuntu/flowgrid
docker compose ps
```

- [ ] 3 containers running (mongodb, backend, frontend)
- [ ] All containers show "healthy" status
- [ ] No containers in "restarting" state

### Step 4: Test Application
- [ ] Frontend loads: `http://YOUR_EC2_IP`
- [ ] Backend health check: `http://YOUR_EC2_IP:5000/health`
- [ ] Login page displays correctly
- [ ] Can register new user
- [ ] Can login successfully
- [ ] Dashboard loads after login
- [ ] API calls work (check browser console)

### Step 5: Test MongoDB Connection
Using MongoDB Compass:
```
mongodb://admin:FlowGrid2024SecurePassword!@YOUR_EC2_IP:27017/flowgrid?authSource=admin
```

- [ ] MongoDB Compass connects successfully
- [ ] `flowgrid` database exists
- [ ] Collections visible (users, employees, etc.)
- [ ] Can view documents

## 🔍 Post-Deployment Verification

### Application Tests
- [ ] Register new user works
- [ ] Login works
- [ ] Logout works
- [ ] Dashboard displays data
- [ ] Employee list loads
- [ ] Can create new employee
- [ ] Can edit employee
- [ ] Can delete employee
- [ ] No console errors in browser

### Performance Tests
- [ ] Page loads in < 3 seconds
- [ ] API responses in < 1 second
- [ ] No memory leaks (check `docker stats`)
- [ ] CPU usage normal (< 50%)

### Security Tests
- [ ] HTTPS not configured yet (add to TODO)
- [ ] MongoDB not accessible from public internet (except your IP)
- [ ] JWT tokens working correctly
- [ ] Password hashing working
- [ ] CORS configured correctly

## 🐛 Troubleshooting

If something fails, check:

### GitHub Actions Failed
- [ ] Check Actions logs for error messages
- [ ] Verify all GitHub Secrets are set correctly
- [ ] Verify Docker Hub credentials
- [ ] Check if EC2 is accessible via SSH

### Containers Not Starting
```bash
ssh -i your-key.pem ubuntu@YOUR_EC2_IP
cd /home/ubuntu/flowgrid
docker compose logs -f
```
- [ ] Check logs for error messages
- [ ] Verify `.env` file is correct
- [ ] Check if ports are available
- [ ] Verify Docker images pulled successfully

### Frontend Not Loading
- [ ] Check nginx logs: `docker compose logs frontend`
- [ ] Verify port 80 is open in Security Group
- [ ] Check if frontend container is healthy
- [ ] Test with curl: `curl http://localhost/`

### Backend Not Responding
- [ ] Check backend logs: `docker compose logs backend`
- [ ] Verify MongoDB is running
- [ ] Check environment variables
- [ ] Test health endpoint: `curl http://localhost:5000/health`

### MongoDB Connection Issues
- [ ] Check MongoDB logs: `docker compose logs mongodb`
- [ ] Verify credentials in `.env`
- [ ] Check if port 27017 is open
- [ ] Test connection from EC2: `docker compose exec mongodb mongosh`

## 📝 Post-Deployment TODO

### Security Improvements
- [ ] Change default MongoDB password
- [ ] Change JWT secret
- [ ] Setup HTTPS with Let's Encrypt
- [ ] Restrict MongoDB port (remove from Security Group)
- [ ] Setup firewall rules
- [ ] Enable CloudWatch monitoring

### Performance Improvements
- [ ] Setup CloudFront CDN
- [ ] Enable gzip compression
- [ ] Setup Redis caching
- [ ] Configure auto-scaling
- [ ] Setup load balancer

### Monitoring
- [ ] Setup CloudWatch alarms
- [ ] Configure log aggregation
- [ ] Setup uptime monitoring
- [ ] Configure backup strategy
- [ ] Setup error tracking (Sentry)

## 🎉 Success Criteria

Your deployment is successful when:
- ✅ All containers are running and healthy
- ✅ Frontend loads without errors
- ✅ Backend API responds correctly
- ✅ MongoDB is accessible and working
- ✅ User can register and login
- ✅ All CRUD operations work
- ✅ Auto-deployment works on git push

## 📞 Need Help?

1. Check logs: `docker compose logs -f [service]`
2. Run test script: `./deploy/test-deployment.sh`
3. Review documentation: `deploy/README.md`
4. Check GitHub Actions logs
5. Verify all checklist items above

---

**Date Deployed**: _______________
**Deployed By**: _______________
**EC2 IP**: _______________
**GitHub Repo**: _______________
