# GitHub Secrets Setup Guide

This guide will help you configure the required GitHub secrets for automated CI/CD deployment.

## Required GitHub Secrets

You need to add the following secrets to your GitHub repository:

### 1. AWS_EC2_HOST
- **Description**: Your EC2 instance's public IP address or domain name
- **Example**: `54.123.45.67` or `ec2-54-123-45-67.compute-1.amazonaws.com`
- **How to get it**: 
  - Go to AWS EC2 Console
  - Select your instance
  - Copy the "Public IPv4 address" or "Public IPv4 DNS"

### 2. AWS_EC2_USER
- **Description**: SSH username for your EC2 instance
- **Value**: `ubuntu` (for Ubuntu instances) or `ec2-user` (for Amazon Linux)
- **Default**: `ubuntu`

### 3. AWS_SSH_KEY
- **Description**: Your private SSH key content (the .pem file)
- **How to get it**:
  ```bash
  # On Windows (PowerShell)
  Get-Content flowgrid-key.pem | clip
  
  # On Mac/Linux
  cat flowgrid-key.pem | pbcopy  # Mac
  cat flowgrid-key.pem           # Linux (copy the output)
  ```
- **Important**: Copy the ENTIRE content including:
  ```
  -----BEGIN RSA PRIVATE KEY-----
  [key content]
  -----END RSA PRIVATE KEY-----
  ```

### 4. MONGODB_URI
- **Description**: MongoDB connection string
- **Options**:
  
  **Option A - Local MongoDB on EC2** (Recommended for this setup):
  ```
  mongodb://localhost:27017/flowgrid
  ```
  
  **Option B - MongoDB Atlas** (Cloud hosted):
  ```
  mongodb+srv://username:password@cluster.mongodb.net/flowgrid?retryWrites=true&w=majority
  ```
  
  **Option C - MongoDB with authentication**:
  ```
  mongodb://admin:password@localhost:27017/flowgrid?authSource=admin
  ```

## How to Add Secrets to GitHub

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Add each secret:
   - Name: `AWS_EC2_HOST`
   - Value: Your EC2 IP address
   - Click **Add secret**
6. Repeat for all 4 secrets

## Verify Your Setup

After adding all secrets, you can verify them:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see all 4 secrets listed:
   - ✅ AWS_EC2_HOST
   - ✅ AWS_EC2_USER
   - ✅ AWS_SSH_KEY
   - ✅ MONGODB_URI

## Initial EC2 Setup

Before the first deployment, you need to set up your EC2 instance. SSH into your EC2:

```bash
ssh -i flowgrid-key.pem ubuntu@YOUR_EC2_IP
```

Then run the initial setup script:

```bash
# Download and run the setup script
curl -o setup.sh https://raw.githubusercontent.com/YOUR_USERNAME/flowgrid/main/setup-ec2.sh
chmod +x setup.sh
./setup.sh
```

Or manually run the commands from `deploy-complete.sh` on your EC2 instance.

## Testing the Workflow

After setting up secrets:

1. Make a small change to your code
2. Commit and push to the `main` branch:
   ```bash
   git add .
   git commit -m "Test CI/CD deployment"
   git push origin main
   ```
3. Go to **Actions** tab in GitHub
4. Watch the workflow run
5. Check the deployment logs

## Troubleshooting

### SSH Connection Failed
- Verify `AWS_EC2_HOST` is correct
- Ensure security group allows SSH (port 22) from GitHub Actions IPs
- Check that `AWS_SSH_KEY` contains the complete private key

### MongoDB Connection Failed
- Verify MongoDB is running: `sudo systemctl status mongod`
- Check `MONGODB_URI` format is correct
- Ensure MongoDB is accessible from the application

### Deployment Failed
- Check GitHub Actions logs for specific errors
- SSH into EC2 and check logs:
  ```bash
  pm2 logs flowgrid-backend
  sudo systemctl status nginx
  sudo systemctl status mongod
  ```

## Security Best Practices

1. **Never commit secrets** to your repository
2. **Rotate SSH keys** periodically
3. **Use strong passwords** for MongoDB if using authentication
4. **Enable firewall** on EC2 (only allow necessary ports)
5. **Keep dependencies updated** regularly

## Next Steps

After successful deployment:

1. Access your application at `http://YOUR_EC2_IP`
2. Test all API endpoints
3. Verify MongoDB data persistence
4. Set up monitoring and alerts
5. Consider adding HTTPS with Let's Encrypt

## Support

If you encounter issues:
1. Check GitHub Actions logs
2. SSH into EC2 and check service logs
3. Review the TROUBLESHOOTING.md file
4. Verify all secrets are correctly set
