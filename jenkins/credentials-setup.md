# Jenkins Credentials Configuration Guide

This guide explains how to configure all required credentials in Jenkins for the CI/CD pipeline.

## Access Jenkins Credentials

1. Navigate to Jenkins Dashboard
2. Go to "Manage Jenkins" → "Manage Credentials"
3. Click on "System" → "Global credentials (unrestricted)"
4. Click "Add Credentials" for each credential below

## Required Credentials

### 1. Docker Hub Credentials
- **ID**: `dockerhub-credentials`
- **Type**: Username with password
- **Username**: Your Docker Hub username
- **Password**: Your Docker Hub access token
- **Description**: Docker Hub registry access

### 2. EC2 SSH Key
- **ID**: `ec2-ssh-key`
- **Type**: SSH Username with private key
- **Username**: `ubuntu`
- **Private Key**: Enter directly (paste your EC2 private key)
- **Description**: EC2 instance SSH access

### 3. EC2 Host
- **ID**: `ec2-host`
- **Type**: Secret text
- **Secret**: Your EC2 instance public IP or domain
- **Description**: EC2 instance hostname

### 4. MongoDB User
- **ID**: `mongo-user`
- **Type**: Secret text
- **Secret**: MongoDB username (e.g., `admin`)
- **Description**: MongoDB database user

### 5. MongoDB Password
- **ID**: `mongo-password`
- **Type**: Secret text
- **Secret**: Strong MongoDB password
- **Description**: MongoDB database password

### 6. JWT Secret
- **ID**: `jwt-secret`
- **Type**: Secret text
- **Secret**: Strong JWT secret key (generate with: `openssl rand -base64 32`)
- **Description**: JWT token signing secret

## GitHub Webhook Configuration

### 1. In GitHub Repository
1. Go to your repository → Settings → Webhooks
2. Click "Add webhook"
3. **Payload URL**: `http://YOUR_JENKINS_IP:8080/github-webhook/`
4. **Content type**: `application/json`
5. **Which events**: Select "Just the push event"
6. **Active**: ✓ Checked
7. Click "Add webhook"

### 2. In Jenkins Job
1. Create new Pipeline job
2. Under "Build Triggers", check "GitHub hook trigger for GITScm polling"
3. Under "Pipeline", select "Pipeline script from SCM"
4. **SCM**: Git
5. **Repository URL**: Your GitHub repository URL
6. **Branch Specifier**: `*/main`
7. **Script Path**: `Jenkinsfile`

## Email Configuration (Optional)

### 1. Configure SMTP in Jenkins
1. Go to "Manage Jenkins" → "Configure System"
2. Find "Extended E-mail Notification" section
3. Configure SMTP server settings:
   - **SMTP server**: `smtp.gmail.com` (for Gmail)
   - **Default user e-mail suffix**: `@yourdomain.com`
   - **Use SMTP Authentication**: ✓ Checked
   - **User Name**: Your email
   - **Password**: App-specific password
   - **Use SSL**: ✓ Checked
   - **SMTP Port**: `465`

### 2. Test Email Configuration
1. Click "Test configuration by sending test e-mail"
2. Enter a test email address
3. Click "Test configuration"

## Security Best Practices

### 1. Enable Security
1. Go to "Manage Jenkins" → "Configure Global Security"
2. **Security Realm**: Jenkins' own user database
3. **Authorization**: Matrix-based security
4. Add users and assign appropriate permissions

### 2. Install Security Plugins
- **Role-based Authorization Strategy**
- **Matrix Authorization Strategy**
- **OWASP Markup Formatter**

### 3. Regular Updates
- Keep Jenkins and plugins updated
- Regularly rotate credentials
- Monitor security advisories

## Troubleshooting

### Common Issues

1. **Docker permission denied**
   ```bash
   sudo usermod -aG docker jenkins
   sudo systemctl restart jenkins
   ```

2. **GitHub webhook not triggering**
   - Check webhook delivery in GitHub settings
   - Verify Jenkins URL is accessible from internet
   - Check Jenkins logs for webhook events

3. **SSH connection to EC2 fails**
   - Verify EC2 security group allows SSH (port 22)
   - Check SSH key format and permissions
   - Test SSH connection manually

4. **Docker build fails**
   - Check Dockerfile syntax
   - Verify base image availability
   - Check build context and file paths

### Useful Commands

```bash
# Check Jenkins logs
sudo journalctl -u jenkins -f

# Restart Jenkins
sudo systemctl restart jenkins

# Check Docker daemon
sudo systemctl status docker

# Test SSH connection
ssh -i /path/to/key ubuntu@EC2_IP

# Check Jenkins disk space
df -h /var/lib/jenkins
```