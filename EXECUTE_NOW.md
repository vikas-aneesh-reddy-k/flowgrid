# ⚡ EXECUTE NOW - Quick Action Guide

## 🎯 What You Need to Do RIGHT NOW

### Step 1: Install Test Dependencies (5 min)
```bash
npm install --save-dev jest @types/jest supertest @types/supertest vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

### Step 2: Test Locally (2 min)
```bash
# Test unit tests work
npm run test:unit

# Test if build works
npm run build

# Test Docker build
docker build -f Dockerfile.frontend -t test-frontend .
docker build -f Dockerfile.backend -t test-backend .
```

### Step 3: Update Jenkinsfile (1 min)
Open `Jenkinsfile` and replace line 7:
```
DOCKER_IMAGE_FRONTEND = 'YOUR-DOCKERHUB-USERNAME/flowgrid-frontend'
DOCKER_IMAGE_BACKEND = 'YOUR-DOCKERHUB-USERNAME/flowgrid-backend'
```

### Step 4: Setup AWS EC2 (15 min)
1. Go to AWS Console → EC2
2. Launch t2.micro Ubuntu instance
3. Download .pem key
4. Connect: `ssh -i key.pem ubuntu@<IP>`
5. Run these commands:

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Jenkins
sudo apt install -y openjdk-17-jdk
curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | sudo tee /usr/share/keyrings/jenkins-keyring.asc
echo deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/ | sudo tee /etc/apt/sources.list.d/jenkins.list
sudo apt update && sudo apt install -y jenkins
sudo systemctl start jenkins

# Get password
sudo cat /var/lib/jenkins/secrets/initialAdminPassword
```

### Step 5: Configure Jenkins (10 min)
1. Open `http://<EC2-IP>:8080`
2. Enter password from above
3. Install suggested plugins
4. Add credentials:
   - Docker Hub (ID: `dockerhub-credentials`)
   - EC2 SSH key (ID: `ec2-ssh-key`)
   - EC2 host (ID: `ec2-host`)
5. Create pipeline job pointing to your GitHub repo

### Step 6: Deploy! (1 min)
```bash
git add .
git commit -m "Add CI/CD pipeline"
git push origin main
```

Watch Jenkins build automatically!

---

## 🚨 IMPORTANT FILES TO UPDATE

1. **Jenkinsfile** - Line 7-8: Add your Docker Hub username
2. **.env** - Create from .env.example with real credentials
3. **GitHub** - Add webhook: `http://<EC2-IP>:8080/github-webhook/`

---

## ✅ VERIFICATION CHECKLIST

- [ ] Dependencies installed
- [ ] Tests run locally
- [ ] Docker builds work
- [ ] Jenkinsfile updated
- [ ] EC2 launched
- [ ] Jenkins running
- [ ] Credentials added
- [ ] Pipeline created
- [ ] Webhook configured
- [ ] Code pushed

---

## 📞 IF SOMETHING FAILS

**Tests fail?**
```bash
npm run test:unit -- --reporter=verbose
```

**Docker fails?**
```bash
docker build -f Dockerfile.frontend . --progress=plain
```

**Jenkins fails?**
- Check Jenkins console output
- Verify credentials
- Check EC2 security groups

---

**Total Time: ~35 minutes**
**Then: Automatic deployments forever!** 🚀
