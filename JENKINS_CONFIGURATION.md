# Jenkins Configuration Guide - Updated for New EC2 IP

## Problem
When Jenkins builds the project, it's using old environment variables that have the old IP address hardcoded. We need to update Jenkins configuration.

## Solution: Update Jenkins Environment Variables

### Option 1: Use Jenkinsfile Variables (RECOMMENDED)

The Jenkinsfile now has hardcoded values:
```groovy
environment {
    DOCKER_USERNAME = 'vikaskakarla'
    FRONTEND_IMAGE = "${DOCKER_USERNAME}/flowgrid-frontend"
    BACKEND_IMAGE = "${DOCKER_USERNAME}/flowgrid-backend"
    VITE_API_URL = '/api'  // Use relative path for nginx proxy
    EC2_HOST = '13.51.176.153'  // Updated EC2 IP
    EC2_USERNAME = 'ubuntu'
}
```

This means Jenkins will ALWAYS use `/api` for the frontend build, regardless of any other settings.

### Option 2: Update Jenkins Global Environment Variables

If Jenkins has global environment variables set, they might override the Jenkinsfile. Here's how to update them:

1. **Open Jenkins Dashboard**
   - Go to: http://YOUR_JENKINS_URL:8080

2. **Navigate to System Configuration**
   - Click "Manage Jenkins" (left sidebar)
   - Click "System" (or "Configure System")

3. **Find Global Properties**
   - Scroll down to "Global properties"
   - Check "Environment variables"

4. **Update or Add Variables**
   - Look for `VITE_API_URL` - Change to `/api`
   - Look for `EC2_HOST` - Change to `13.51.176.153`
   - Look for `EC2_USERNAME` - Should be `ubuntu`

5. **Save Configuration**
   - Click "Save" at the bottom

### Option 3: Update Job-Specific Environment Variables

If the variables are set in the job configuration:

1. **Open Your Pipeline Job**
   - Go to Jenkins Dashboard
   - Click on your FlowGrid pipeline job

2. **Configure Job**
   - Click "Configure" (left sidebar)

3. **Check Build Environment**
   - Look for "This project is parameterized" or "Environment variables"
   - Update any variables with old IP addresses

4. **Check Pipeline Script**
   - If using "Pipeline script from SCM", it will use the Jenkinsfile from GitHub
   - Make sure it's pulling from the latest commit

5. **Save Configuration**

## Verify Jenkins Configuration

### Step 1: Check Jenkinsfile is Latest

1. In Jenkins job, click "Configure"
2. Under "Pipeline" section, verify:
   - Definition: "Pipeline script from SCM"
   - SCM: Git
   - Repository URL: Your GitHub repo
   - Branch: `*/main`

3. Make sure "Lightweight checkout" is UNCHECKED (so it gets latest code)

### Step 2: Trigger a New Build

1. Click "Build Now"
2. Click on the build number (e.g., #5)
3. Click "Console Output"
4. Look for the build command:
   ```
   docker build ... --build-arg VITE_API_URL=/api ...
   ```
5. Should show `/api` NOT the old IP

### Step 3: Check Build Logs

In the console output, verify:
- ✅ `VITE_API_URL=/api` in the docker build command
- ✅ `EC2_HOST=13.51.176.153` in deployment step
- ❌ NO references to old IP (16.170.155.235)

## Common Issues and Fixes

### Issue 1: Jenkins Still Using Old IP

**Cause:** Jenkins has cached the old Jenkinsfile or environment variables

**Fix:**
1. Go to job → Configure
2. Under "Pipeline", change branch to `*/main` (if not already)
3. Save
4. Click "Build Now"
5. If still failing, restart Jenkins:
   ```bash
   sudo systemctl restart jenkins
   ```

### Issue 2: Build Args Not Being Passed

**Cause:** Docker build command not using the environment variable

**Fix:** Check the Jenkinsfile line:
```groovy
bat "docker build -t ${FRONTEND_IMAGE}:${env.GIT_COMMIT_SHORT} -f Dockerfile.frontend --build-arg VITE_API_URL=${env.VITE_API_URL} . || exit 0"
```

Should use `${env.VITE_API_URL}` which is set to `/api` in the environment block.

### Issue 3: Credentials Not Set

**Cause:** Jenkins doesn't have Docker Hub or EC2 SSH credentials

**Fix:**
1. Go to "Manage Jenkins" → "Credentials"
2. Add credentials:
   - **docker-hub-credentials**: Docker Hub username/password
   - **ec2-ssh-key**: EC2 private key (flowgrid.pem content)

## Manual Build Test (Without Jenkins)

To verify the build works correctly:

```bash
# Build frontend with correct API URL
docker build --build-arg VITE_API_URL=/api -f Dockerfile.frontend -t vikaskakarla/flowgrid-frontend:test .

# Check the built files
docker run --rm vikaskakarla/flowgrid-frontend:test cat /usr/share/nginx/html/index.html | grep -o "http://[^\"]*" | head -5
```

Should NOT show any hardcoded IPs, only relative paths like `/api`.

## GitHub Actions Alternative

If Jenkins is too complex, you can use GitHub Actions instead:

1. The `.github/workflows/deploy.yml` is already configured
2. It uses GitHub Secrets (not Jenkins environment variables)
3. Already updated to use `/api` and new EC2 IP
4. Triggers automatically on push to main branch

To use GitHub Actions:
1. Go to your GitHub repo → Settings → Secrets and variables → Actions
2. Verify/Add secrets:
   - `DOCKER_USERNAME`: vikaskakarla
   - `DOCKER_PASSWORD`: Your Docker Hub password
   - `EC2_SSH_KEY`: Content of flowgrid.pem file

3. Push to main branch - GitHub Actions will automatically build and deploy

## Recommended Approach

**Use the Jenkinsfile with hardcoded values** (already done):
- ✅ No need to configure Jenkins environment variables
- ✅ Values are in version control (GitHub)
- ✅ Consistent across all builds
- ✅ Easy to update (just edit Jenkinsfile and push)

The current Jenkinsfile has:
```groovy
VITE_API_URL = '/api'
EC2_HOST = '13.51.176.153'
```

So every build will use these values automatically.

## Final Verification

After updating Jenkins configuration:

1. **Trigger new build** in Jenkins
2. **Check console output** for:
   - `--build-arg VITE_API_URL=/api`
   - Deployment to `13.51.176.153`
3. **After deployment**, clear browser cache and test
4. **Verify** no errors about old IP in browser console

## Summary

✅ Jenkinsfile updated with correct values
✅ GitHub Actions workflow updated
✅ Both will now build with `/api` instead of old IP
✅ Both will deploy to new EC2 IP (13.51.176.153)

**Next:** Trigger a new build in Jenkins and verify it uses the correct values!
