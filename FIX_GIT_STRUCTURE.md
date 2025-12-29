# Fix Git Repository Structure

## Problem
Your GitHub repository has TWO folders:
- `flowgrid` (old code)
- `flowgrid_v1` (new code - where you're working)

Jenkins is building from the ROOT of the repo, which has the OLD code in various folders. Your new code in `flowgrid_v1` is not being used!

## Solution: Move flowgrid_v1 contents to root

### Step 1: Backup Current State
```bash
# Make sure all changes are committed
cd C:\Users\kakar\flowgrid_v1
git status
git add .
git commit -m "Backup before restructure"
git push origin main
```

### Step 2: Check Parent Directory
```bash
cd C:\Users\kakar
ls
```

You should see both `flowgrid` and `flowgrid_v1` folders.

### Step 3: The Real Problem

Your Git repository structure on GitHub looks like this:
```
flowgrid (repo root)
├── .github/
├── deploy/
├── docker/
├── flowgrid/          ← OLD subfolder
├── flowgrid_v1/       ← NEW subfolder (your current work)
├── jenkins/
├── monitoring/
├── public/
├── scripts/
├── server/
├── src/
└── ... other files
```

Jenkins/GitHub Actions are building from the ROOT, which has:
- OLD `src/` folder
- OLD `server/` folder  
- OLD `package.json`

Your NEW code is in `flowgrid_v1/` subfolder, which is NOT being built!

### Step 4: Fix the Structure

We need to:
1. Delete the old `flowgrid` subfolder from the repo
2. Move everything from `flowgrid_v1` to the root
3. Delete the `flowgrid_v1` folder

**Commands:**

```bash
# Navigate to parent directory
cd C:\Users\kakar

# Check if there's a .git folder here
ls -Force

# If there's a .git folder in C:\Users\kakar, that's the problem!
# The repo root is in your user directory, not in flowgrid_v1
```

### Step 5: Proper Fix

**Option A: If .git is in C:\Users\kakar (WRONG LOCATION)**

This means your entire user directory is a Git repo! We need to fix this:

```bash
# 1. Clone the repo fresh to a new location
cd C:\
git clone https://github.com/vikas-aneesh-reddy-k/flowgrid.git flowgrid_clean

# 2. Copy flowgrid_v1 contents to the clean repo
cd flowgrid_clean
# Delete old folders
Remove-Item -Recurse -Force flowgrid, flowgrid_v1 -ErrorAction SilentlyContinue

# 3. Copy your current work
Copy-Item -Recurse C:\Users\kakar\flowgrid_v1\* . -Force

# 4. Commit and push
git add .
git commit -m "Restructure: move flowgrid_v1 contents to root"
git push origin main -f

# 5. Update your working directory
cd C:\Users\kakar
Remove-Item -Recurse -Force flowgrid_v1
Move-Item C:\flowgrid_clean flowgrid_v1
```

**Option B: If .git is in C:\Users\kakar\flowgrid_v1 (CORRECT)**

Then the issue is that flowgrid_v1 itself is the repo, and it has subfolders. We need to check what's actually on GitHub.

### Step 6: Quick Check

Run this to see the actual structure:

```bash
cd C:\Users\kakar\flowgrid_v1
git ls-tree -r --name-only HEAD | head -20
```

This will show you what files are actually in the Git repo.

### Step 7: Simplest Solution

**Just update Jenkinsfile to build from flowgrid_v1:**

Update Jenkinsfile to use the correct path:

```groovy
stage('Checkout') {
    steps {
        checkout scm
        dir('flowgrid_v1') {
            // All build steps here
        }
    }
}
```

Or update GitHub Actions workflow:

```yaml
- name: Build frontend
  working-directory: ./flowgrid_v1
  run: |
    docker build ...
```

## Recommended Approach

**Clean up the repository structure on GitHub:**

1. Create a new branch with clean structure
2. Delete old folders
3. Move flowgrid_v1 contents to root
4. Update all paths in CI/CD configs
5. Merge to main

Would you like me to create a script to do this automatically?
