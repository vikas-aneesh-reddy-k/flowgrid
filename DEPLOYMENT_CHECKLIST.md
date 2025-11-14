# CI/CD Deployment Checklist

## ✅ Pre-Deployment Checklist

### AWS Setup
- [ ] AWS account created
- [ ] EC2 t2.micro instance launched (Ubuntu 22.04)
- [ ] Security groups configured (ports: 22, 80, 443, 8080, 5000)
- [ ] SSH key pair downloaded (.pem file)
- [ ] Elastic IP assigned (optional but recommended)

### Docker Hub Setup
- [ ] Docker Hub account created
- [ ] Repository created: `username/flowgrid-frontend`
- [ ] Repository created: `username/flowgrid-backend`
- [ ] Docker Hub credentials ready

### GitHub Setup
- [ ] Repository created/exists
- [ ] Code pushed to main branch
- [ ] Webhook access available

### Local Setup
- [ ] All files committed to Git
- [ ] `.env.example` updated with correct values
- [ ] `Jenkinsfile` updated with Docker Hub username
- [ ] Tests passing locally: `npm run test:all`

---

## 🔧 Installation Checklist

### On EC2 Instance
- [ ] Connected via SSH
- [ ] Docker installed and running
- [ ] Docker Compose installed
- [ ] Jenkins installed and running
- [ ] Java 17 installed
- [ ] Git installed
- [ ] User added to docker group

### Jenkins Configuration
- [ ] Jenkins accessible at `http://<EC2-IP>:8080`
- [ ] Initial admin password retrieved
- [ ] Suggested plugins installed
- [ ] Additional plugins installed:
  - [ ] Docker Pipeline
  - [ ] SSH Agent
  - [ ] GitHub Integration
  - [ ] HTML Publisher
- [ ] Admin user created

### Jenkins Credentials
- [ ] Docker Hub credentials added (ID: `dockerhub-credentials`)
- [ ] EC2 SSH key added (ID: `ec2-ssh-key`)
- [ ] EC2 host added (ID: `ec2-host`)

### Project Setup on EC2
- [ ] Repository cloned to `/home/ubuntu/flowgrid`
- [ ] `.env` file created and configured
- [ ] MongoDB credentials set
- [ ] JWT secret generated
- [ ] Manual test deployment successful

---

## 🚀 Pipeline Setup Checklist

### Jenkins Pipeline
- [ ] New pipeline job created
- [ ] Pipeline name: `flowgrid-pipeline`
- [ ] SCM configured (Git)
- [ ] Repository URL added
- [ ] Branch set to `main`
- [ ] Script path set to `Jenkinsfile`
- [ ] GitHub webhook trigger enabled

### GitHub Webhook
- [ ] Webhook added to repository
- [ ] Payload URL: `http://<EC2-IP>:8080/github-webhook/`
- [ ] Content type: `application/json`
- [ ] Push events selected
- [ ] Webhook active

---

## 🧪 Testing Checklist

### Local Testing
- [ ] Unit tests pass: `npm run test:unit`
- [ ] API tests pass: `npm run test:api`
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Build succeeds: `npm run build`
- [ ] Type check passes: `npm run typecheck`

### Docker Testing
- [ ] Frontend image builds: `docker build -f Dockerfile.frontend .`
- [ ] Backend image builds: `docker build -f Dockerfile.backend .`
- [ ] Docker Compose starts: `docker-compose up -d`
- [ ] Services healthy: `docker ps`
- [ ] Health check passes: `curl http://localhost:5000/api/health`

---

## 📦 First Deployment Checklist

### Pre-Deployment
- [ ] All code committed
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Jenkins pipeline configured
- [ ] GitHub webhook configured

### Deployment
- [ ] Push code to GitHub: `git push origin main`
- [ ] Jenkins build triggered automatically
- [ ] Watch Jenkins console output
- [ ] All pipeline stages pass:
  - [ ] Checkout
  - [ ] Install Dependencies
  - [ ] Lint & Type Check
  - [ ] Unit Tests
  - [ ] API Tests
  - [ ] Build
  - [ ] E2E Tests
  - [ ] Docker Build
  - [ ] Push to Docker Hub
  - [ ] Deploy to EC2
  - [ ] Smoke Tests

### Post-Deployment Verification
- [ ] Application accessible: `http://<EC2-IP>`
- [ ] API accessible: `http://<EC2-IP>/api/health`
- [ ] Login works
- [ ] Dashboard loads
- [ ] Data displays correctly
- [ ] No console errors

---

## 🔍 Monitoring Checklist

### Immediate Checks
- [ ] All containers running: `docker ps`
- [ ] No container restarts: Check restart count
- [ ] Logs clean: `docker-compose logs`
- [ ] Health endpoints responding
- [ ] Database connected

### Ongoing Monitoring
- [ ] Jenkins build history reviewed
- [ ] Test reports checked
- [ ] Disk space monitored: `df -h`
- [ ] Memory usage checked: `free -h`
- [ ] Docker images cleaned: `docker image prune -af`

---

## 🐛 Troubleshooting Checklist

### If Build Fails
- [ ] Check Jenkins console output
- [ ] Verify all credentials configured
- [ ] Check Docker Hub login
- [ ] Verify EC2 SSH connection
- [ ] Review test failures
- [ ] Check environment variables

### If Deployment Fails
- [ ] Check EC2 disk space
- [ ] Verify Docker is running
- [ ] Check docker-compose.yml syntax
- [ ] Review deployment logs
- [ ] Verify network connectivity
- [ ] Check security group rules

### If Application Fails
- [ ] Check container logs: `docker-compose logs`
- [ ] Verify MongoDB connection
- [ ] Check environment variables
- [ ] Verify health endpoints
- [ ] Review application logs
- [ ] Check port availability

---

## 📋 Maintenance Checklist

### Daily
- [ ] Check Jenkins build status
- [ ] Review failed builds
- [ ] Monitor application logs

### Weekly
- [ ] Review test coverage
- [ ] Check disk space usage
- [ ] Clean old Docker images
- [ ] Review security updates

### Monthly
- [ ] Update dependencies
- [ ] Review AWS costs
- [ ] Backup database
- [ ] Review and update documentation

---

## 🎉 Success Criteria

Your CI/CD pipeline is successful when:
- ✅ Code push triggers automatic build
- ✅ All tests pass automatically
- ✅ Docker images build successfully
- ✅ Deployment happens automatically
- ✅ Application is accessible
- ✅ Health checks pass
- ✅ No manual intervention needed

---

## 📞 Support Resources

- **Jenkins Docs:** https://www.jenkins.io/doc/
- **Docker Docs:** https://docs.docker.com/
- **AWS EC2 Guide:** https://docs.aws.amazon.com/ec2/
- **Playwright Docs:** https://playwright.dev/

---

**Ready to deploy?** Start with `CI_CD_QUICK_START.md`! 🚀
