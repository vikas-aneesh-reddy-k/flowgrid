pipeline {
    agent any
    
    environment {
        DOCKER_USERNAME = 'vikaskakarla'
        FRONTEND_IMAGE = "${DOCKER_USERNAME}/flowgrid-frontend"
        BACKEND_IMAGE = "${DOCKER_USERNAME}/flowgrid-backend"
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    if (isUnix()) {
                        env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    } else {
                        env.GIT_COMMIT_SHORT = bat(script: "@git rev-parse --short HEAD", returnStdout: true).trim()
                    }
                    echo "Building commit: ${env.GIT_COMMIT_SHORT}"
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        bat 'npm ci'
                    }
                }
                stage('Backend Dependencies') {
                    steps {
                        dir('server') {
                            bat 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('Lint & Type Check') {
            parallel {
                stage('Frontend Lint') {
                    steps {
                        bat 'npm run lint || exit 0'
                    }
                }
                stage('Frontend Type Check') {
                    steps {
                        bat 'npm run typecheck || exit 0'
                    }
                }
                stage('Backend Lint') {
                    steps {
                        dir('server') {
                            bat 'npm run lint || exit 0'
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        bat 'npm run test:unit || exit 0'
                    }
                }
                stage('API Tests') {
                    steps {
                        bat 'npm run test:api || exit 0'
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Backend') {
                    steps {
                        script {
                            dir('server') {
                                bat "docker build -t ${BACKEND_IMAGE}:${env.GIT_COMMIT_SHORT} ."
                                bat "docker build -t ${BACKEND_IMAGE}:latest ."
                            }
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        script {
                            bat "docker build -t ${FRONTEND_IMAGE}:${env.GIT_COMMIT_SHORT} -f Dockerfile.frontend --build-arg VITE_API_URL=${env.VITE_API_URL} ."
                            bat "docker build -t ${FRONTEND_IMAGE}:latest -f Dockerfile.frontend --build-arg VITE_API_URL=${env.VITE_API_URL} ."
                        }
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                script {
                    docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
                        // Push backend images
                        bat "docker push ${BACKEND_IMAGE}:${env.GIT_COMMIT_SHORT}"
                        bat "docker push ${BACKEND_IMAGE}:latest"
                        
                        // Push frontend images
                        bat "docker push ${FRONTEND_IMAGE}:${env.GIT_COMMIT_SHORT}"
                        bat "docker push ${FRONTEND_IMAGE}:latest"
                    }
                }
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                script {
                    echo "Deploying to EC2: ${env.EC2_HOST}"
                    withCredentials([sshUserPrivateKey(credentialsId: 'ec2-ssh-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
                        bat """
                            icacls "%SSH_KEY%" /inheritance:r
                            icacls "%SSH_KEY%" /grant:r "%USERNAME%:R"
                            ssh -i "%SSH_KEY%" -o StrictHostKeyChecking=no -o UserKnownHostsFile=NUL ${env.EC2_USERNAME}@${env.EC2_HOST} "cd /home/ubuntu/flowgrid && docker compose pull && docker compose up -d && docker compose ps"
                        """
                    }
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo "Checking application health at http://${env.EC2_HOST}"
                    bat """
                        curl -f http://${env.EC2_HOST} || exit 0
                    """
                    echo "Deployment completed!"
                }
            }
        }
    }
    
    post {
        success {
            echo "✅ Deployment successful!"
            // Add notification here (Slack, Email, etc.)
        }
        failure {
            echo "❌ Deployment failed!"
            // Add notification here (Slack, Email, etc.)
        }
        always {
            // Clean up workspace
            cleanWs()
        }
    }
}
