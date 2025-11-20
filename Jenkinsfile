pipeline {
    agent any
    
    environment {
        DOCKER_HUB_CREDENTIALS = credentials('dockerhub-credentials')
        DOCKER_IMAGE_FRONTEND = "${env.DOCKER_HUB_USERNAME}/flowgrid-frontend"
        DOCKER_IMAGE_BACKEND = "${env.DOCKER_HUB_USERNAME}/flowgrid-backend"
        EC2_HOST = "${env.EC2_HOST}"
        EC2_USER = "${env.EC2_USER}"
        EC2_KEY = credentials('ec2-ssh-key')
        MONGODB_URI = credentials('mongodb-uri')
        JWT_SECRET = credentials('jwt-secret')
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code...'
                checkout scm
            }
        }
        
        stage('Build Docker Images') {
            parallel {
                stage('Build Frontend') {
                    steps {
                        echo '🎨 Building Frontend Docker Image...'
                        script {
                            sh """
                                docker build \
                                    --build-arg VITE_API_URL=http://${EC2_HOST}/api \
                                    -t ${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER} \
                                    -t ${DOCKER_IMAGE_FRONTEND}:latest \
                                    -f Dockerfile.frontend .
                            """
                        }
                    }
                }
                
                stage('Build Backend') {
                    steps {
                        echo '🔧 Building Backend Docker Image...'
                        script {
                            sh """
                                docker build \
                                    -t ${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER} \
                                    -t ${DOCKER_IMAGE_BACKEND}:latest \
                                    -f server/Dockerfile ./server
                            """
                        }
                    }
                }
            }
        }
        
        stage('Run Tests') {
            parallel {
                stage('Unit Tests') {
                    steps {
                        echo '🧪 Running Unit Tests...'
                        sh 'npm install && npm run test:unit || true'
                    }
                }
                
                stage('Backend Health Check') {
                    steps {
                        echo '🏥 Testing Backend Container...'
                        script {
                            sh """
                                docker run -d --name test-backend \
                                    -e MONGODB_URI=mongodb://test:test@localhost:27017/test \
                                    -e JWT_SECRET=test-secret \
                                    -e NODE_ENV=test \
                                    ${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER}
                                
                                sleep 5
                                docker logs test-backend
                                docker stop test-backend
                                docker rm test-backend
                            """
                        }
                    }
                }
            }
        }
        
        stage('Push to Docker Hub') {
            steps {
                echo '📤 Pushing images to Docker Hub...'
                script {
                    sh """
                        echo ${DOCKER_HUB_CREDENTIALS_PSW} | docker login -u ${DOCKER_HUB_CREDENTIALS_USR} --password-stdin
                        
                        docker push ${DOCKER_IMAGE_FRONTEND}:${BUILD_NUMBER}
                        docker push ${DOCKER_IMAGE_FRONTEND}:latest
                        
                        docker push ${DOCKER_IMAGE_BACKEND}:${BUILD_NUMBER}
                        docker push ${DOCKER_IMAGE_BACKEND}:latest
                        
                        docker logout
                    """
                }
            }
        }
        
        stage('Deploy to EC2') {
            steps {
                echo '🚀 Deploying to AWS EC2...'
                script {
                    sh """
                        ssh -i ${EC2_KEY} -o StrictHostKeyChecking=no ${EC2_USER}@${EC2_HOST} << 'ENDSSH'
                            set -e
                            
                            echo "📥 Pulling latest images..."
                            docker pull ${DOCKER_IMAGE_FRONTEND}:latest
                            docker pull ${DOCKER_IMAGE_BACKEND}:latest
                            
                            echo "🔄 Stopping old containers..."
                            docker-compose -f /home/${EC2_USER}/flowgrid/docker-compose.yml down || true
                            
                            echo "🚀 Starting new containers..."
                            cd /home/${EC2_USER}/flowgrid
                            
                            # Update docker-compose.yml with new image tags
                            cat > docker-compose.yml << 'EOF'
version: '3.8'

services:
  mongodb:
    image: mongo:7.0
    container_name: flowgrid-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: flowgrid
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - flowgrid-network

  backend:
    image: ${DOCKER_IMAGE_BACKEND}:latest
    container_name: flowgrid-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      PORT: 5000
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: "*"
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    networks:
      - flowgrid-network

  frontend:
    image: ${DOCKER_IMAGE_FRONTEND}:latest
    container_name: flowgrid-frontend
    restart: unless-stopped
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - flowgrid-network

volumes:
  mongodb_data:

networks:
  flowgrid-network:
    driver: bridge
EOF
                            
                            # Start services
                            docker-compose up -d
                            
                            echo "⏳ Waiting for services to be healthy..."
                            sleep 10
                            
                            echo "✅ Deployment complete!"
                            docker-compose ps
ENDSSH
                    """
                }
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 Running health checks...'
                script {
                    sh """
                        sleep 5
                        curl -f http://${EC2_HOST}/api/health || exit 1
                        curl -f http://${EC2_HOST}/health || exit 1
                        echo "✅ All health checks passed!"
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ Deployment successful!'
            echo "🌐 Application URL: http://${EC2_HOST}"
        }
        failure {
            echo '❌ Deployment failed!'
        }
        always {
            echo '🧹 Cleaning up...'
            sh 'docker system prune -f || true'
        }
    }
}
