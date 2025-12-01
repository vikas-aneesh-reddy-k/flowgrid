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
                        bat 'npm run lint'
                    }
                }
                stage('Frontend Type Check') {
                    steps {
                        bat 'npm run typecheck'
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
                        bat 'npm run test:unit'
                    }
                }
                stage('API Tests') {
                    steps {
                        bat 'npm run test:api'
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
                    sshagent(credentials: ['ec2-ssh-key']) {
                        bat """
                            ssh -o StrictHostKeyChecking=no ${env.EC2_USERNAME}@${env.EC2_HOST} "cd /home/ubuntu/flowgrid && docker compose pull && docker compose up -d --no-deps --build && sleep 10 && docker compose ps && docker image prune -af --filter until=24h"
                        """
                    }
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    bat """
                        echo Checking application health...
                        curl -f http://${env.EC2_HOST}/health || exit 1
                        echo Application is healthy!
                    """
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
