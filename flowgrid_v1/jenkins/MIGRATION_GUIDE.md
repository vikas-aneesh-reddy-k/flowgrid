# Migration from GitHub Actions to Jenkins

This guide helps you migrate from your current GitHub Actions setup to Jenkins.

## What's Changing

### Before (GitHub Actions)
- Builds run on GitHub's infrastructure
- Configuration in `.github/workflows/deploy.yml`
- Automatic triggers on push
- Secrets managed in GitHub

### After (Jenkins)
- Builds run on your own Jenkins server
- Configuration in `Jenkinsfile` (root directory)
- Webhook triggers from GitHub
- Credentials managed in Jenkins

## Migration Steps

### 1. Keep GitHub Actions Running (During Setup)

Don't delete `.github/workflows/deploy.yml` yet. Keep it as a backup until Jenkins is fully tested.

### 2. Install and Configure Jenkins

Follow the complete setup in [JENKINS_SETUP.md](./JENKINS_SETUP.md):

```bash
# Install Jenkins
chmod +x jenkins/install-jenkins.sh
./jenkins/install-jenkins.sh

# Access Jenkins at http://YOUR_JENKINS_IP:8080
# Complete the setup wizard
```

### 3. Configure Jenkins Pipeline

1. Create credentials in Jenkins (Docker Hub, EC2 SSH)
2. Set environment variables (EC2_HOST, VITE_API_URL)
3. Create pipeline job pointing to your repository
4. Configure GitHub webhook

### 4. Test Jenkins Pipeline

```bash
# Manual test first
# Go to Jenkins → Your Pipeline → Build Now

# Then test automatic trigger
git commit -m "test: jenkins pipeline"
git push origin main
```

### 5. Disable GitHub Actions (After Testing)

Once Jenkins is working reliably:

```bash
# Option 1: Rename the workflow file (keeps it for reference)
git mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled

# Option 2: Delete the workflow file
git rm .github/workflows/deploy.yml

git commit -m "chore: migrate to Jenkins CI/CD"
git push origin main
```

## Feature Comparison

| Feature | GitHub Actions | Jenkins |
|---------|---------------|---------|
| **Cost** | Free for public repos, limited for private | Free, but you pay for server |
| **Infrastructure** | GitHub-managed | Self-hosted (your EC2) |
| **Setup Complexity** | Easy | Moderate |
| **Customization** | Limited | Highly customizable |
| **Build Speed** | Fast (GitHub servers) | Depends on your server |
| **Plugins** | GitHub Marketplace | 1800+ Jenkins plugins |
| **Secrets Management** | GitHub Secrets | Jenkins Credentials |
| **Logs Retention** | Limited | Unlimited (your storage) |
| **Parallel Builds** | Limited by plan | Limited by your server |

## Configuration Mapping

### GitHub Actions → Jenkins

#### Secrets
```yaml
# GitHub Actions
${{ secrets.DOCKER_USERNAME }}
${{ secrets.EC2_HOST }}
```

```groovy
// Jenkins (configured in Jenkins UI)
${env.EC2_HOST}
credentials('docker-hub-credentials')
```

#### Environment Variables
```yaml
# GitHub Actions
env:
  DOCKER_USERNAME: vikaskakarla
```

```groovy
// Jenkins
environment {
    DOCKER_USERNAME = 'vikaskakarla'
}
```

#### Build Steps
```yaml
# GitHub Actions
- name: Build backend
  uses: docker/build-push-action@v5
  with:
    context: ./server
```

```groovy
// Jenkins
stage('Build Backend') {
    steps {
        script {
            docker.build("${BACKEND_IMAGE}:latest", "./server")
        }
    }
}
```

## Advantages of Jenkins

1. **Full Control**: You own the infrastructure
2. **No Rate Limits**: Build as much as you want
3. **Better Debugging**: Direct access to build environment
4. **Custom Plugins**: Install any plugin you need
5. **Private Network**: Can access internal resources
6. **Cost Effective**: For high-volume builds

## Potential Issues and Solutions

### Issue: Slower Builds
**Solution**: Upgrade Jenkins server instance type (t2.medium → t2.large)

### Issue: Docker Build Cache
**Solution**: Jenkins uses local cache, which is faster than GitHub Actions

### Issue: Webhook Not Triggering
**Solution**: 
- Check GitHub webhook delivery status
- Ensure Jenkins is accessible from internet
- Verify webhook URL: `http://YOUR_JENKINS_IP:8080/github-webhook/`

### Issue: Out of Disk Space
**Solution**: 
```bash
# Clean up old Docker images
docker system prune -af

# Increase EC2 volume size
# AWS Console → EC2 → Volumes → Modify Volume
```

## Rollback Plan

If you need to rollback to GitHub Actions:

1. Re-enable the workflow file:
   ```bash
   git mv .github/workflows/deploy.yml.disabled .github/workflows/deploy.yml
   git commit -m "chore: rollback to GitHub Actions"
   git push origin main
   ```

2. Disable Jenkins webhook in GitHub repository settings

3. Keep Jenkins running for investigation

## Testing Checklist

Before fully migrating:

- [ ] Jenkins can build frontend successfully
- [ ] Jenkins can build backend successfully
- [ ] All tests pass in Jenkins
- [ ] Docker images are pushed to Docker Hub
- [ ] Deployment to EC2 works
- [ ] Health checks pass after deployment
- [ ] Webhook triggers automatically on push
- [ ] Build time is acceptable
- [ ] Notifications work (if configured)

## Cost Comparison

### GitHub Actions (Private Repo)
- Free tier: 2,000 minutes/month
- After: $0.008 per minute
- Example: 100 builds/month × 10 min = $8/month

### Jenkins
- EC2 t2.medium: ~$35/month (24/7)
- Or use existing EC2 instance: $0/month
- Unlimited builds

## Support

Need help with migration?
- Review [JENKINS_SETUP.md](./JENKINS_SETUP.md)
- Check Jenkins logs: `/var/lib/jenkins/logs/`
- Test SSH access manually before configuring Jenkins
