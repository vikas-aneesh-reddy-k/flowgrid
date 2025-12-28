# Jenkins Setup on Windows for FlowGrid Deployment

Complete guide to configure Jenkins on Windows to deploy to AWS EC2.

## Prerequisites

1. Jenkins installed on Windows
2. Docker Desktop installed and running
3. Git installed
4. OpenSSH client (comes with Windows 10/11)
5. AWS EC2 instance with your app
6. Your EC2 `.pem` key file

## Step 1: Install Required Jenkins Plugins

1. Open Jenkins: `http://localhost:8080`
2. Go to **Manage Jenkins** → **Plugins** → **Available plugins**
3. Search and install these plugins:
   - **SSH Credentials Plugin**
   - **Docker Pipeline**
   - **Git Plugin** (usually pre-installed)
   - **Pipeline** (usually pre-installed)

4. Click **Install** and restart Jenkins when done

## Step 2: Add Docker Hub Credentials

1. Go to **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. Click **Add Credentials**
3. Fill in:
   - **Kind**: Username with password
   - **Username**: `vikaskakarla`
   - **Password**: Your Docker Hub access token (get from https://hub.docker.com/settings/security)
   - **ID**: `docker-hub-credentials`
   - **Description**: Docker Hub Credentials
4. Click **Create**

## Step 3: Add EC2 SSH Key

1. Go to **Manage Jenkins** → **Credentials** → **System** → **Global credentials**
2. Click **Add Credentials**
3. Fill in:
   - **Kind**: SSH Username with private key
   - **ID**: `ec2-ssh-key`
   - **Description**: EC2 SSH Key
   - **Username**: `ubuntu`
   - **Private Key**: Click **Enter directly**
   - Click **Add** and paste your entire `.pem` file content:
     ```
     -----BEGIN RSA PRIVATE KEY-----
     [your key content here]
     -----END RSA PRIVATE KEY-----
     ```
4. Click **Create**

## Step 4: Configure Environment Variables

1. Go to **Manage Jenkins** → **System**
2. Scroll to **Global properties**
3. Check **Environment variables**
4. Add these variables:

   | Name | Value | Example |
   |------|-------|---------|
   | `EC2_HOST` | Your EC2 public IP | `16.170.155.235` |
   | `EC2_USERNAME` | SSH username | `ubuntu` |
   | `VITE_API_URL` | Your API URL | `http://16.170.155.235:5000/api` |

5. Click **Save**

## Step 5: Verify OpenSSH is Available

1. Open Command Prompt or PowerShell
2. Run these commands to verify:
   ```cmd
   ssh -V
   scp -h
   ```
3. If not found, enable OpenSSH:
   - Go to **Settings** → **Apps** → **Optional Features**
   - Click **Add a feature**
   - Install **OpenSSH Client**

## Step 6: Test SSH Connection

1. Open Command Prompt
2. Navigate to where your `.pem` file is located
3. Test connection:
   ```cmd
   ssh -i your-key.pem ubuntu@YOUR_EC2_IP
   ```
4. Type `yes` when prompted about fingerprint
5. If connected successfully, type `exit`

## Step 7: Create Jenkins Pipeline Job

1. From Jenkins dashboard, click **New Item**
2. Enter name: `flowgrid-production`
3. Select **Pipeline**
4. Click **OK**
5. In configuration:
   - **Description**: FlowGrid Production Deployment
   - **Build Triggers**: Check **GitHub hook trigger for GITScm polling**
   - **Pipeline**:
     - **Definition**: Pipeline script from SCM
     - **SCM**: Git
     - **Repository URL**: Your GitHub repo URL
     - **Credentials**: Add your GitHub credentials if private repo
     - **Branch**: `*/main` (or `*/master`)
     - **Script Path**: `Jenkinsfile`
6. Click **Save**

## Step 8: Configure GitHub Webhook (Optional)

To trigger builds automatically on push:

1. Go to your GitHub repository
2. Click **Settings** → **Webhooks** → **Add webhook**
3. Fill in:
   - **Payload URL**: `http://YOUR_JENKINS_IP:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Which events**: Just the push event
   - **Active**: Checked
4. Click **Add webhook**

**Note**: Your Jenkins must be publicly accessible for webhooks to work.

## Step 9: Test the Pipeline

1. Go to your pipeline job
2. Click **Build Now**
3. Watch the build progress
4. Check console output for any errors

## Troubleshooting

### Issue: "ssh: command not found"

**Solution**: Install OpenSSH Client (see Step 5)

### Issue: "Permission denied (publickey)"

**Solution**: 
1. Verify your `.pem` key is correct in Jenkins credentials
2. Make sure the key has proper format (including BEGIN/END lines)
3. Test SSH connection manually first (Step 6)

### Issue: "Host key verification failed"

**Solution**: 
1. Manually SSH to EC2 once to accept the fingerprint (Step 6)
2. Or add this to your SSH config:
   ```
   StrictHostKeyChecking no
   ```

### Issue: Docker commands fail

**Solution**:
1. Make sure Docker Desktop is running
2. Restart Jenkins service
3. Add Jenkins user to Docker group (if on Linux)

### Issue: "curl: command not found"

**Solution**: The updated Jenkinsfile no longer uses curl, so this shouldn't happen.

### Issue: Build fails at "Deploy to EC2"

**Solution**:
1. Check Jenkins credentials are set correctly
2. Verify EC2_HOST environment variable is set
3. Test SSH connection manually
4. Check EC2 security group allows SSH (port 22)
5. View full console output for specific error

### Issue: Docker images not found on EC2

**Solution**:
1. Verify images were pushed to Docker Hub successfully
2. Check Docker Hub credentials in Jenkins
3. Manually pull images on EC2:
   ```bash
   ssh -i your-key.pem ubuntu@YOUR_EC2_IP
   cd /home/ubuntu/flowgrid
   docker compose pull
   ```

## Verify Deployment

After successful build:

1. **Check Frontend**: `http://YOUR_EC2_IP`
2. **Check Backend**: `http://YOUR_EC2_IP:5000/health`
3. **Check Containers**:
   ```bash
   ssh -i your-key.pem ubuntu@YOUR_EC2_IP
   docker compose ps
   ```

## Pipeline Stages Explained

1. **Checkout SCM**: Gets code from GitHub
2. **Install Dependencies**: Installs npm packages for frontend and backend
3. **Lint & Type Check**: Runs code quality checks
4. **Run Tests**: Executes unit and API tests
5. **Build Docker Images**: Creates Docker images for frontend and backend
6. **Push to Docker Hub**: Uploads images to Docker Hub
7. **Deploy to EC2**: SSHs to EC2 and updates containers
8. **Health Check**: Verifies the app is running

## Security Best Practices

1. **Never commit credentials** to Git
2. **Use Jenkins credentials** for all secrets
3. **Restrict Jenkins access** with authentication
4. **Use HTTPS** for Jenkins if publicly accessible
5. **Regularly update** Jenkins and plugins
6. **Backup Jenkins** configuration regularly

## Next Steps

After successful deployment:

1. Set up automated backups for MongoDB
2. Configure HTTPS with Let's Encrypt
3. Set up monitoring and alerts
4. Configure log aggregation
5. Set up staging environment

## Quick Reference Commands

### View Jenkins Logs (Windows)
```cmd
# Check Jenkins service
services.msc
# Find "Jenkins" service and check status
```

### Restart Jenkins
```cmd
# Stop Jenkins
net stop jenkins

# Start Jenkins
net start jenkins
```

### Manual Deployment
```cmd
# SSH to EC2
ssh -i your-key.pem ubuntu@YOUR_EC2_IP

# Update deployment
cd /home/ubuntu/flowgrid
docker compose pull
docker compose down
docker compose up -d
docker compose ps
```

### View Logs on EC2
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f mongodb
```

## Support

If you encounter issues:
1. Check Jenkins console output
2. Verify all credentials are set
3. Test SSH connection manually
4. Check EC2 security groups
5. Review Docker logs on EC2

---

**Last Updated**: December 2024
**Jenkins Version**: 2.x
**Windows Version**: 10/11
