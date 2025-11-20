# Setup GitHub Self-Hosted Runner on EC2

## Why Self-Hosted Runner?

GitHub Actions cannot connect to your EC2 via SSH due to network restrictions. A self-hosted runner runs ON your EC2 and listens for deployment jobs.

## Setup Steps (5 minutes)

### 1. Get Runner Token from GitHub

1. Go to: `https://github.com/vikas-aneesh-reddy-k/flowgrid/settings/actions/runners/new`
2. Select **Linux** and **x64**
3. Copy the commands shown (we'll use them below)

### 2. SSH into EC2

```bash
ssh -i flowgrid-key.pem ubuntu@13.53.86.36
```

### 3. Install Runner

Run the commands from GitHub (they look like this):

```bash
# Create a folder
mkdir actions-runner && cd actions-runner

# Download the latest runner package
curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz

# Extract the installer
tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
```

### 4. Configure Runner

```bash
# Configure (use the token from GitHub)
./config.sh --url https://github.com/vikas-aneesh-reddy-k/flowgrid --token YOUR_TOKEN_HERE

# When prompted:
# - Runner name: ec2-runner (or press Enter)
# - Runner group: Default (press Enter)
# - Labels: self-hosted,Linux,X64 (press Enter)
# - Work folder: _work (press Enter)
```

### 5. Install as Service

```bash
# Install as a service (runs automatically)
sudo ./svc.sh install
sudo ./svc.sh start
```

### 6. Verify

```bash
# Check status
sudo ./svc.sh status

# Should show: "active (running)"
```

## ✅ Done!

Now when you push to `main`, the runner on your EC2 will:
1. Pull the code
2. Build frontend & backend
3. Deploy to Nginx
4. Restart PM2
5. Verify everything works

**Test it:** Make a commit and push to main!

## Troubleshooting

### Check runner status:
```bash
cd ~/actions-runner
sudo ./svc.sh status
```

### View runner logs:
```bash
cd ~/actions-runner
tail -f _diag/Runner_*.log
```

### Restart runner:
```bash
cd ~/actions-runner
sudo ./svc.sh restart
```

### Remove runner:
```bash
cd ~/actions-runner
sudo ./svc.sh stop
sudo ./svc.sh uninstall
./config.sh remove --token YOUR_TOKEN
```

## How It Works

```
You push to GitHub
       ↓
GitHub notifies runner on EC2
       ↓
Runner pulls code
       ↓
Runner builds & deploys
       ↓
✅ Live!
```

**No SSH needed!** The runner connects FROM EC2 TO GitHub (outbound), not the other way around.
