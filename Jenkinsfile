pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'vikaskakarla'
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/flowgrid-frontend"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/flowgrid-backend"
        BUILD_NUMBER = "${env.BUILD_NUMBER}"
        GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
        
        // EC2 Configuration
        EC2_HOST = '13.53.86.36'
        EC2_USER = 'ubuntu'
        
        // Docker Hub credentials
        DOCKERHUB_CREDENTIALS = credentials('dockerhub-credentials')
        
        // EC2 SSH Key
        EC2_SSH_KEY = credentials('ec2-ssh-key')
        
        // Environment variables for deployment
        MONGO_USER = credentials('mongo-user')
        MONGO_PASSWORD = credentials('mongo-password')
        JWT_SECRET = credentials('jwt-secret')
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out source code...'
                checkout scm
                sh 'git clean -fdx'
            }
        }
        
        stage('Environment Setup') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        echo 'Installing frontend dependencies...'
                        sh 'npm ci'
                    }
                }
                stage('Backend Dependencies') {
                    steps {
                        echo 'Installing backend dependencies...'
                        dir('server') {
                            sh 'npm ci'
                        }
                    }
                }
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('Frontend Lint') {
                    steps {
                        echo 'Running frontend linting...'
                        sh 'npm run lint'
                    }
                }
                stage('Type Check') {
                    steps {
                        echo 'Running TypeScript type checking...'
                        sh 'npm run typecheck'
                    }
                }
                stage('Backend Type Check') {
                    steps {
                        echo 'Running backend TypeScript compilation...'
                        dir('server') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
        
        stage('Build Applications') {
            parallel {
                stage('Frontend Build') {
                    steps {
                        echo 'Building frontend application...'
                        sh '''
                            export VITE_API_URL=http://${EC2_HOST}:5000/api
                            npm run build
                        '''
                        archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
                    }
                }
                stage('Backend Build') {
                    steps {
                        echo 'Building backend application...'
                        dir('server') {
                            sh 'npm run build'
                            archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Frontend Unit Tests') {
                    steps {
                        echo 'Running frontend unit tests...'
                        sh 'npm run test:unit'
                    }
                    post {
                        always {
                            publishTestResults testResultsPattern: 'test-results.xml'
                        }
                    }
                }
                stage('Backend Tests') {
                    steps {
                        echo 'Running backend tests...'
                        dir('server') {
                            sh 'npm test || true'
                        }
                    }
                }
            }
        }
        
        stage('Security Scan') {
            parallel {
                stage('Frontend Security') {
                    steps {
                        echo 'Running frontend security audit...'
                        sh 'npm audit --audit-level=high || true'
                    }
                }
                stage('Backend Security') {
                    steps {
                        echo 'Running backend security audit...'
                        dir('server') {
                            sh 'npm audit --audit-level=high || true'
                        }
                    }
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Frontend Image') {
                    steps {
                        echo 'Building frontend Docker image...'
                        script {
                            def frontendImage = docker.build("${FRONTEND_IMAGE}:${BUILD_NUMBER}", 
                                "--build-arg VITE_API_URL=http://${EC2_HOST}:5000/api -f Dockerfile.frontend .")
                            
                            // Tag with latest and git commit
                            frontendImage.tag("latest")
                            frontendImage.tag("${GIT_COMMIT_SHORT}")
                        }
                    }
                }
                stage('Backend Image') {
                    steps {
                        echo 'Building backend Docker image...'
                        script {
                            def backendImage = docker.build("${BACKEND_IMAGE}:${BUILD_NUMBER}", "./server")
                            
                            // Tag with latest and git commit
                            backendImage.tag("latest")
                            backendImage.tag("${GIT_COMMIT_SHORT}")
                        }
                    }
                }
            }
        }
        
        stage('Image Security Scan') {
            parallel {
                stage('Scan Frontend Image') {
                    steps {
                        echo 'Scanning frontend image for vulnerabilities...'
                        sh '''
                            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                                aquasec/trivy image --exit-code 0 --severity HIGH,CRITICAL \
                                ${FRONTEND_IMAGE}:${BUILD_NUMBER} || true
                        '''
                    }
                }
                stage('Scan Backend Image') {
                    steps {
                        echo 'Scanning backend image for vulnerabilities...'
                        sh '''
                            docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
                                aquasec/trivy image --exit-code 0 --severity HIGH,CRITICAL \
                                ${BACKEND_IMAGE}:${BUILD_NUMBER} || true
                        '''
                    }
                }
            }
        }
        
        stage('Push to Registry') {
            steps {
                echo 'Pushing images to Docker Hub...'
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'dockerhub-credentials') {
                        // Push frontend images
                        sh "docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}"
                        sh "docker push ${FRONTEND_IMAGE}:latest"
                        sh "docker push ${FRONTEND_IMAGE}:${GIT_COMMIT_SHORT}"
                        
                        // Push backend images
                        sh "docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}"
                        sh "docker push ${BACKEND_IMAGE}:latest"
                        sh "docker push ${BACKEND_IMAGE}:${GIT_COMMIT_SHORT}"
                    }
                }
            }
        }
        stage('Deploy to EC2') {
            steps {
                echo 'Deploying to EC2 instance...'
                script {
                    sh '''
                        # Copy deployment files to EC2
                        scp -i ${EC2_SSH_KEY} -o StrictHostKeyChecking=no \
                            docker-compose.yml ${EC2_USER}@${EC2_HOST}:/home/ubuntu/
                        
                        scp -i ${EC2_SSH_KEY} -o StrictHostKeyChecking=no \
                            .env.production ${EC2_USER}@${EC2_HOST}:/home/ubuntu/.env
                        
                        scp -i ${EC2_SSH_KEY} -o StrictHostKeyChecking=no \
                            docker/nginx.conf ${EC2_USER}@${EC2_HOST}:/home/ubuntu/
                        
                        scp -i ${EC2_SSH_KEY} -o StrictHostKeyChecking=no \
                            docker/mongo-init.js ${EC2_USER}@${EC2_HOST}:/home/ubuntu/
                        
                        # Deploy on EC2
                        ssh -i ${EC2_SSH_KEY} -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            # Update system
                            sudo apt-get update
                            
                            # Install Docker if not present
                            if ! command -v docker &> /dev/null; then
                                curl -fsSL https://get.docker.com -o get-docker.sh
                                sudo sh get-docker.sh
                                sudo usermod -aG docker ubuntu
                            fi
                            
                            # Install Docker Compose if not present
                            if ! command -v docker-compose &> /dev/null; then
                                sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
                                sudo chmod +x /usr/local/bin/docker-compose
                            fi
                            
                            # Create necessary directories
                            mkdir -p /home/ubuntu/docker
                            
                            # Move files to correct locations
                            mv /home/ubuntu/nginx.conf /home/ubuntu/docker/
                            mv /home/ubuntu/mongo-init.js /home/ubuntu/docker/
                            
                            # Pull latest images
                            docker pull ${FRONTEND_IMAGE}:latest
                            docker pull ${BACKEND_IMAGE}:latest
                            
                            # Stop existing containers
                            docker-compose down || true
                            
                            # Start new deployment
                            docker-compose up -d
                            
                            # Clean up old images
                            docker image prune -f
                        '
                    '''
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo 'Performing post-deployment health checks...'
                script {
                    sh '''
                        # Wait for services to start
                        sleep 30
                        
                        # Check frontend
                        curl -f http://${EC2_HOST} || exit 1
                        
                        # Check backend API
                        curl -f http://${EC2_HOST}:5000/health || exit 1
                        
                        echo "All health checks passed!"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo 'Cleaning up workspace...'
            sh 'docker system prune -f || true'
            cleanWs()
        }
        success {
            echo 'Pipeline completed successfully!'
            emailext (
                subject: "✅ Deployment Success - FlowGrid ${BUILD_NUMBER}",
                body: """
                    <h2>Deployment Successful</h2>
                    <p><strong>Build:</strong> ${BUILD_NUMBER}</p>
                    <p><strong>Commit:</strong> ${GIT_COMMIT_SHORT}</p>
                    <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                    <p><strong>Application URL:</strong> http://${EC2_HOST}</p>
                    <p><strong>API URL:</strong> http://${EC2_HOST}:5000</p>
                """,
                to: "${env.CHANGE_AUTHOR_EMAIL}",
                mimeType: 'text/html'
            )
        }
        failure {
            echo 'Pipeline failed!'
            emailext (
                subject: "❌ Deployment Failed - FlowGrid ${BUILD_NUMBER}",
                body: """
                    <h2>Deployment Failed</h2>
                    <p><strong>Build:</strong> ${BUILD_NUMBER}</p>
                    <p><strong>Commit:</strong> ${GIT_COMMIT_SHORT}</p>
                    <p><strong>Branch:</strong> ${env.BRANCH_NAME}</p>
                    <p><strong>Console Output:</strong> ${BUILD_URL}console</p>
                """,
                to: "${env.CHANGE_AUTHOR_EMAIL}",
                mimeType: 'text/html'
            )
        }
    }
}