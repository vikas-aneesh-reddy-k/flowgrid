# Complete CI/CD Pipeline Setup Guide

This guide provides step-by-step instructions to set up the complete CI/CD pipeline for FlowGrid using Jenkins, Docker, AWS EC2, and GitHub.

## 🏗️ Architecture Overview

```
GitHub Repository → Jenkins CI/CD → Docker Registry → AWS EC2 Deployment
     ↓                    ↓              ↓              ↓
  Webhook Trigger    Build & Test    Store Images    Rolling Update
```

## 📋 Prerequisites

- AWS Account with EC2 access
- GitHub repository with admin access
- Docker Hub account
- Domain name (optional, for SSL)

## 🚀 Phase 1: AWS EC2 Setup

### 1.1 Launch EC2 Instance

1. **Launch Instance**:
   - AMI: Ubuntu Server 22.04 LTS
   - Instance Type: t3.micro (or larger for production)
   - Key Pair: Create or use existing
   - Security Group: Allow SSH (22), HTTP (80), HTTPS (443), Custom (5000, 8080)

2. **Connect to Instance**:
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Run Setup Script**:
   ```bash
   wget https://raw.githubusercontent.com/your-repo/flowgrid/main/aws/ec2-setup.sh
   chmod +x ec2-setup.sh
   ./ec2-setup.sh
   ```

### 1.2 Configure Environment

1. **Create Environment File**:
   ```bash
   cd /home/ubuntu/app
   cp .env.template .env
   nano .env
   ```

2. **Set Environment Variables**:
   ```env
   MONGO_USER=admin
   MONGO_PASSWORD=your_secure_password
   JWT_SECRET=your_jwt_secret_key
   REDIS_PASSWORD=your_redis_password
   GRAFANA_PASSWORD=your_grafana_password
   ```

## 🔧 Phase 2: Jenkins Server Setup

### 2.1 Install Jenkins

1. **Launch Jenkins Server** (separate EC2 instance or same):
   ```bash
   wget https://raw.githubusercontent.com/your-repo/flowgrid/main/jenkins/setup.sh
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Access Jenkins**:
   - URL: `http://your-jenkins-ip:8080`
   - Get initial password: `sudo cat /var/lib/jenkins/secrets/initialAdminPassword`

3. **Complete Setup Wizard**:
   - Install suggested plugins
   - Create admin user
   - Configure Jenkins URL

### 2.2 Install Required Plugins

Navigate to "Manage Jenkins" → "Manage Plugins" and install:

- Git Plugin
- GitHub Plugin
- Pipeline Plugin
- Docker Pipeline Plugin
- AWS Credentials Plugin
- Email Extension Plugin
- Build Timeout Plugin
- Timestamper Plugin
- Workspace Cleanup Plugin

### 2.3 Configure Global Tools

Go to "Manage Jenkins" → "Global Tool Configuration":

1. **Git**: Auto-install latest
2. **Node.js**: Install Node.js 20.x
3. **Docker**: Auto-install latest

## 🔐 Phase 3: Credentials Configuration

### 3.1 Add Credentials in Jenkins

Navigate to "Manage Jenkins" → "Manage Credentials" → "System" → "Global credentials":

1. **Docker Hub Credentials**:
   - ID: `dockerhub-credentials`
   - Type: Username with password
   - Username: Your Docker Hub username
   - Password: Docker Hub access token

2. **EC2 SSH Key**:
   - ID: `ec2-ssh-key`
   - Type: SSH Username with private key
   - Username: `ubuntu`
   - Private Key: Your EC2 private key content

3. **EC2 Host**:
   - ID: `ec2-host`
   - Type: Secret text
   - Secret: Your EC2 public IP

4. **MongoDB Credentials**:
   - ID: `mongo-user` (Secret text: `admin`)
   - ID: `mongo-password` (Secret text: your password)

5. **JWT Secret**:
   - ID: `jwt-secret`
   - Type: Secret text
   - Secret: Generate with `openssl rand -base64 32`

### 3.2 Configure GitHub Integration

1. **GitHub Personal Access Token**:
   - Go to GitHub Settings → Developer settings → Personal access tokens
   - Generate token with `repo` and `admin:repo_hook` permissions
   - Add as Jenkins credential (ID: `github-token`)

## 🔄 Phase 4: Pipeline Configuration

### 4.1 Create Jenkins Pipeline Job

1. **New Item**:
   - Name: `FlowGrid-CI-CD`
   - Type: Pipeline
   - Click OK

2. **Configure Pipeline**:
   - **Build Triggers**: ✓ GitHub hook trigger for GITScm polling
   - **Pipeline Definition**: Pipeline script from SCM
   - **SCM**: Git
   - **Repository URL**: Your GitHub repository URL
   - **Credentials**: Select GitHub token
   - **Branch Specifier**: `*/main`
   - **Script Path**: `Jenkinsfile`

### 4.2 Configure GitHub Webhook

1. **Repository Settings**:
   - Go to your GitHub repository
   - Settings → Webhooks → Add webhook

2. **Webhook Configuration**:
   - **Payload URL**: `http://your-jenkins-ip:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Which events**: Just the push event
   - **Active**: ✓ Checked

## 🧪 Phase 5: Testing and Validation

### 5.1 Test Pipeline

1. **Manual Trigger**:
   - Go to Jenkins job
   - Click "Build Now"
   - Monitor console output

2. **Automatic Trigger**:
   - Push code to main branch
   - Verify webhook triggers build
   - Check all pipeline stages complete

### 5.2 Verify Deployment

1. **Check Application**:
   ```bash
   curl http://your-ec2-ip/health
   curl http://your-ec2-ip:5000/health
   ```

2. **Monitor Services**:
   ```bash
   ssh ubuntu@your-ec2-ip
   cd /home/ubuntu/app
   ./monitor.sh
   ```

## 📊 Phase 6: Monitoring Setup

### 6.1 Enable Monitoring Stack

1. **Update Docker Compose**:
   ```bash
   cd /home/ubuntu/app
   cp docker/docker-compose.prod.yml docker-compose.yml
   ```

2. **Start Monitoring Services**:
   ```bash
   docker-compose up -d prometheus grafana
   ```

3. **Access Dashboards**:
   - Prometheus: `http://your-ec2-ip:9090`
   - Grafana: `http://your-ec2-ip:3000` (admin/your_grafana_password)

### 6.2 Configure Alerts

1. **Email Notifications**:
   - Configure SMTP in Jenkins
   - Update Jenkinsfile email settings

2. **Slack Integration** (optional):
   - Install Slack plugin in Jenkins
   - Configure webhook URL

## 🔒 Phase 7: Security Hardening

### 7.1 EC2 Security

1. **Firewall Configuration**:
   ```bash
   sudo ufw enable
   sudo ufw allow ssh
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

2. **SSL Certificate** (optional):
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

### 7.2 Jenkins Security

1. **Enable Security**:
   - Configure authentication
   - Set up authorization matrix
   - Enable CSRF protection

2. **Regular Updates**:
   ```bash
   # Update Jenkins and plugins regularly
   sudo systemctl stop jenkins
   sudo apt update && sudo apt upgrade jenkins
   sudo systemctl start jenkins
   ```

## 🚨 Phase 8: Disaster Recovery

### 8.1 Backup Strategy

1. **Automated Backups**:
   - Database backups before each deployment
   - Configuration file backups
   - Docker image versioning

2. **Backup Verification**:
   ```bash
   # Test rollback procedure
   cd /home/ubuntu/app
   chmod +x scripts/deployment-rollback.sh
   ./scripts/deployment-rollback.sh status
   ```

### 8.2 Rollback Procedures

1. **Quick Rollback**:
   ```bash
   ./scripts/deployment-rollback.sh rollback v1.2.3
   ```

2. **Emergency Rollback**:
   ```bash
   ./scripts/deployment-rollback.sh emergency
   ```

## 📈 Phase 9: Performance Optimization

### 9.1 Resource Monitoring

1. **Set Resource Limits**:
   - Update docker-compose.prod.yml with resource constraints
   - Monitor CPU and memory usage

2. **Scaling Considerations**:
   - Horizontal scaling with load balancer
   - Database replication for high availability

### 9.2 Build Optimization

1. **Docker Layer Caching**:
   - Optimize Dockerfile layer order
   - Use multi-stage builds

2. **Parallel Builds**:
   - Utilize Jenkins parallel stages
   - Optimize test execution time

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check Jenkins logs
   sudo journalctl -u jenkins -f
   
   # Check Docker daemon
   sudo systemctl status docker
   ```

2. **Deployment Issues**:
   ```bash
   # Check application logs
   docker-compose logs -f
   
   # Check service health
   ./monitor.sh
   ```

3. **Network Issues**:
   ```bash
   # Test connectivity
   curl -v http://your-ec2-ip/health
   
   # Check security groups
   # Verify firewall rules
   ```

### Support Resources

- **Jenkins Documentation**: https://www.jenkins.io/doc/
- **Docker Documentation**: https://docs.docker.com/
- **AWS EC2 Documentation**: https://docs.aws.amazon.com/ec2/
- **GitHub Actions**: https://docs.github.com/en/actions

## ✅ Success Criteria

Your CI/CD pipeline is successfully set up when:

- ✅ Code pushes to main branch trigger automatic builds
- ✅ All tests pass in the CI pipeline
- ✅ Docker images are built and pushed to registry
- ✅ Applications deploy automatically to EC2
- ✅ Health checks pass after deployment
- ✅ Monitoring and alerting are functional
- ✅ Rollback procedures are tested and working

## 🎉 Conclusion

You now have a complete, production-ready CI/CD pipeline that automatically builds, tests, and deploys your FlowGrid application. The pipeline includes monitoring, security, and disaster recovery capabilities to ensure reliable operation in production environments.