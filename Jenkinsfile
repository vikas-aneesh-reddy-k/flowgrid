pipeline {
    agent any
    
    environment {
        DOCKER_USERNAME = 'vikaskakarla'
        FRONTEND_IMAGE = "${DOCKER_USERNAME}/flowgrid-frontend"
        BACKEND_IMAGE = "${DOCKER_USERNAME}/flowgrid-backend"
        GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
                echo "Building commit: ${GIT_COMMIT_SHORT}"
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        sh 'npm ci'
                    }
                }
                stage('Backend Dependencies') {
                    steps {
                        dir('server') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('Lint & Type Check') {
            parallel {
                stage('Frontend Lint') {
                    steps {
                        sh 'npm run lint'
                    }
                }
                stage('Frontend Type Check') {
                    steps {
                        sh 'npm run typecheck'
                    }
                }
                stage('Backend Lint') {
                    steps {
                        dir('server') {
                            sh 'npm run lint || true'
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        sh 'npm run test:unit'
                    }
                }
                stage('API Tests') {
                    steps {
                        sh 'npm run test:api'
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
                                docker.build("${BACKEND_IMAGE}:${GIT_COMMIT_SHORT}", ".")
                                docker.build("${BACKEND_IMAGE}:latest", ".")
                            }
                        }
                    }
                }
                stage('Build Frontend') {
                    steps {
                        script {
                            docker.build(
                                "${FRONTEND_IMAGE}:${GIT_COMMIT_SHORT}",
                                "-f Dockerfile.frontend --build-arg VITE_API_URL=${env.VITE_API_URL} ."
                            )
                            docker.build(
                                "${FRONTEND_IMAGE}:latest",
                                "-f Dockerfile.frontend --build-arg VITE_API_URL=${env.VITE_API_URL} ."
                            )
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
                        sh "docker push ${BACKEND_IMAGE}:${GIT_COMMIT_SHORT}"
                        sh "docker push ${BACKEND_IMAGE}:latest"
                        
                        // Push frontend images
                        sh "docker push ${FRONTEND_IMAGE}:${GIT_COMMIT_SHORT}"
                        sh "docker push ${FRONTEND_IMAGE}:latest"
                    }
                }
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                script {
                    sshagent(credentials: ['ec2-ssh-key']) {
                        sh """
                            ssh -o StrictHostKeyChecking=no ${env.EC2_USERNAME}@${env.EC2_HOST} '
                                cd /home/ubuntu/flowgrid
                                
                                # Pull latest images
                                docker compose pull
                                
                                # Restart services with zero downtime
                                docker compose up -d --no-deps --build
                                
                                # Wait for health checks
                                sleep 10
                                
                                # Verify deployment
                                docker compose ps
                                
                                # Clean up old images
                                docker image prune -af --filter "until=24h"
                            '
                        """
                    }
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    sh """
                        echo "Checking application health..."
                        curl -f http://${env.EC2_HOST}/health || exit 1
                        echo "Application is healthy!"
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
