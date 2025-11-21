# Jenkins Setup Guide

Follow these steps to configure your Jenkins server for the FlowGrid CI/CD pipeline.

## 1. Install Required Plugins
1.  Go to **Manage Jenkins** > **Plugins** > **Available plugins**.
2.  Search for and install the following:
    -   `Docker Pipeline`
    -   `Docker`
    -   `Pipeline` (usually installed by default)
    -   `SSH Agent`
    -   `Email Extension` (optional, for notifications)

## 2. Configure Credentials
You need to add the following credentials in **Manage Jenkins** > **Credentials** > **System** > **Global credentials (unrestricted)**.

| ID | Kind | Description | Content |
| :--- | :--- | :--- | :--- |
| `dockerhub-credentials` | Username with password | Docker Hub Login | Your Docker Hub Username & Password |
| `ec2-host` | Secret text | EC2 Public IP | The Public IP address of your EC2 instance |
| `ec2-ssh-key` | SSH Username with private key | SSH Key for EC2 | **Username**: `ubuntu`<br>**Private Key**: Paste the content of your `.pem` file |
| `mongo-user` | Secret text | MongoDB Username | `admin` (or your preferred username) |
| `mongo-password` | Secret text | MongoDB Password | A strong password for the database |
| `jwt-secret` | Secret text | JWT Secret | A long random string for token signing |

## 3. Create the Pipeline Job
1.  Go to **Dashboard** > **New Item**.
2.  Enter a name (e.g., `flowgrid-pipeline`).
3.  Select **Pipeline** and click **OK**.
4.  Scroll down to the **Pipeline** section.
5.  **Definition**: Select `Pipeline script from SCM`.
6.  **SCM**: Select `Git`.
7.  **Repository URL**: Enter your GitHub repository URL.
8.  **Branch Specifier**: `*/main`.
9.  Click **Save**.

## 4. EC2 Preparation
1.  SSH into your EC2 instance.
2.  Copy the setup script content (from `scripts/setup-ec2.sh`) to a file on the server, or clone the repo.
3.  Run the script: `bash setup-ec2.sh`.
4.  Log out and log back in.

## 5. Run the Pipeline
1.  Go to your Jenkins job.
2.  Click **Build Now**.
3.  Monitor the console output for progress.
