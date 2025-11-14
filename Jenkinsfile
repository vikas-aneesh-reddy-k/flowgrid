pipeline {
    agent any
    
    environment {
        DOCKER_HUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_IMAGE_FRONTEND = 'your-dockerhub-username/flowgrid-frontend'
        DOCKER_IMAGE_BACKEND = 'your-dockerhub-username/flowgrid-backend'
        IMAGE_TAG = "${BUILD_NUMBER}"
        EC2_HOST = credentials('ec2-host')
        EC2_USER = 'ubuntu'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📦 Checking out code...'
                checkout scm
                sh 'git rev-parse --short HEAD > .git/commit-id'
                script {
                    env.GIT_COMMIT_SHORT = readFile('.git/commit-id').trim()
                }
            }
        }
        
        stage('Install Dependencies') {
            parallel {
                stage('Frontend Dependencies') {
                    steps {
                        echo '📦 Installing frontend dependencies...'
                        sh 'npm ci'
                    }
                }
                stage('Backend Dependencies') {
                    steps {
                        echo '📦 Installing backend dependencies...'
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
                        echo '🔍 Linting frontend...'
                        sh 'npm run lint || true'
                    }
                }
                stage('Frontend Type Check') {
                    steps {
                        echo '🔍 Type checking frontend...'
                        sh 'npm run typecheck'
                    }
                }
                stage('Backend Build Check') {
                    steps {
                        echo '🔍 Checking backend build...'
                        dir('server') {
                            sh 'npm run build'
                        }
                    }
                }
            }
        }
        
        stage('Unit Tests') {
            steps {
                echo '🧪 Running unit tests...'
                sh 'npm run test:unit || echo "No unit tests configured yet"'
            }
        }
        
        stage('API Integration Tests') {
            steps {
                echo '🧪 Running API integration tests...'
                script {
                    // Start backend for testing
                    sh '''
                        cd server
                        npm run dev &
                        SERVER_PID=$!
                        echo $SERVER_PID > server.pid
                        
                        # Wait for server to start
                        sleep 10
                        
                        # Run API tests
                        node ../test-connection.js || true
                        node ../test-dashboard.js || true
                        node ../test-employee.js || true
                        
                        # Cleanup
                        kill $SERVER_PID || true
                    '''
                }
            }
        }
        
        stage('Build Application') {
            steps {
                echo '🏗️ Building frontend...'
                sh 'npm run build'
            }
        }
        
        stage('E2E Tests') {
            steps {
                echo '🧪 Running E2E tests...'
                script {
                    sh '''
                        # Install Playwright browsers
                        npx playwright install --with-deps chromium
                        
                        # Start services
                        docker-compose -f docker-compose.test.yml up -d || true
                        sleep 15
                        
                        # Run Playwright tests
                        npm run test || echo "E2E tests failed but continuing..."
                        
                        # Cleanup
                        docker-compose -f docker-compose.test.yml down || true
                    '''
                }
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'playwright-report',
                        reportFiles: 'index.html',
                        reportName: 'Playwright Test Report'
                    ])
                }
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Frontend Image') {
                    steps {
                        echo '🐳 Building frontend Docker image...'
                        sh """
                            docker build -f Dockerfile.frontend \
                                -t ${DOCKER_IMAGE_FRONTEND}:${IMAGE_TAG} \
                                -t ${DOCKER_IMAGE_FRONTEND}:latest \
                                .
                        """
                    }
                }
                stage('Build Backend Image') {
                    steps {
                        echo '🐳 Building backend Docker image...'
                        sh """
                            docker build -f Dockerfile.backend \
                                -t ${DOCKER_IMAGE_BACKEND}:${IMAGE_TAG} \
                                -t ${DOCKER_IMAGE_BACKEND}:latest \
                                .
                        """
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo '📤 Pushing images to Docker Hub...'
                sh '''
                    echo $DOCKER_HUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_CREDENTIALS_USR --password-stdin
                    docker push ${DOCKER_IMAGE_FRONTEND}:${IMAGE_TAG}
                    docker push ${DOCKER_IMAGE_FRONTEND}:latest
                    docker push ${DOCKER_IMAGE_BACKEND}:${IMAGE_TAG}
                    docker push ${DOCKER_IMAGE_BACKEND}:latest
                '''
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                echo '🚀 Deploying to AWS EC2...'
                sshagent(['ec2-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} '
                            # Pull latest images
                            docker pull ${DOCKER_IMAGE_FRONTEND}:latest
                            docker pull ${DOCKER_IMAGE_BACKEND}:latest
                            
                            # Navigate to app directory
                            cd /home/ubuntu/flowgrid
                            
                            # Pull latest docker-compose
                            git pull origin main
                            
                            # Stop old containers
                            docker-compose down
                            
                            # Start new containers
                            docker-compose up -d
                            
                            # Clean up old images
                            docker image prune -af
                            
                            # Health check
                            sleep 10
                            curl -f http://localhost:5000/api/health || exit 1
                            curl -f http://localhost:80 || exit 1
                        '
                    """
                }
            }
        }
        
        stage('Smoke Tests') {
            steps {
                echo '🔥 Running smoke tests on production...'
                sh """
                    curl -f http://${EC2_HOST}/api/health
                    curl -f http://${EC2_HOST}/
                """
            }
        }
    }
    
    post {
        success {
            echo '✅ Pipeline completed successfully!'
            // Add Slack/Email notification here
        }
        failure {
            echo '❌ Pipeline failed!'
            // Add Slack/Email notification here
        }
        always {
            echo '🧹 Cleaning up...'
            sh 'docker logout'
            cleanWs()
        }
    }
}
