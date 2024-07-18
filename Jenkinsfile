pipeline {
    agent any

    environment {
        DOCKER_CREDENTIALS_ID = 'doceker_deploy'  // Usa el ID de tus credenciales configuradas
        IMAGE_NAME = 'my-react-vite-app'                 // Nombre de tu imagen Docker
        IMAGE_TAG = 'latest'                             // Tag de la imagen
    }

    stages {
        stage('Checkout') {
            steps {
                // Clona el repositorio
                git 'https://github.com/tu_usuario/tu_repositorio.git'
            }
        }
        stage('Build Docker Image') {
            steps {
                script {
                    // Construir la imagen Docker
                    docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                }
            }
        }
        stage('Push Docker Image') {
            steps {
                script {
                    // Inicia sesión en Docker Hub
                    docker.withRegistry('https://index.docker.io/v1/', "${DOCKER_CREDENTIALS_ID}") {
                        // Empuja la imagen al registro
                        docker.image("${IMAGE_NAME}:${IMAGE_TAG}").push()
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    // Desplegar los contenedores (ejemplo básico, puedes personalizar según sea necesario)
                    sh 'docker-compose down'
                    sh 'docker-compose up -d'
                }
            }
        }
    }
}
