# 🚀 Sistema de Gestión - Conexión con APIs Distribuidas

Este proyecto implementa un cliente web que se conecta a múltiples instancias de APIs usando **Consul** y **Traefik** para balanceo de carga.

## 📋 Arquitectura de Conexión

### 🏗️ Estrategia de Conexión

El sistema implementa una **estrategia de fallback en cascada**:

1. **🎯 Traefik (Primario)**: Usa Traefik como load balancer principal
2. **🔄 Fallback Directo**: Si Traefik falla, intenta conectar directamente a cada instancia
3. **⚡ Auto-retry**: Reintentos automáticos con delay configurable
4. **💓 Health Monitoring**: Monitoreo en tiempo real del estado de las instancias

### 🌐 Configuración de URLs

```javascript
// Ejemplo de configuración para Authors API
TRAEFIK_URL: 'http://localhost:80/authors'  // Load balancer principal
INSTANCE_URLS: [
  'http://localhost:8081/authors',  // Instancia 1
  'http://localhost:8082/authors',  // Instancia 2
  'http://localhost:8083/authors'   // Instancia 3
]
```

## 🔧 Configuración por Servicio

### 👤 Authors API
- **Traefik**: `http://localhost:80/authors`
- **Instancias**: 8081, 8082, 8083

### 📚 Books API
- **Traefik**: `http://localhost:80/books`
- **Instancias**: 8084, 8085, 8086

### 👥 Customers API
- **Traefik**: `http://localhost:80/customers`
- **Instancias**: 8087, 8088, 8089

## 🚀 Configuración de Traefik

### docker-compose.yml para Traefik
```yaml
version: '3.8'

services:
  traefik:
    image: traefik:v2.8
    command:
      - "--api.insecure=true"
      - "--providers.consul.endpoints=consul:8500"
      - "--entrypoints.web.address=:80"
    ports:
      - "80:80"
      - "8080:8080"  # Dashboard de Traefik
    depends_on:
      - consul
    networks:
      - microservices

  consul:
    image: consul:1.12
    command: consul agent -dev -ui -client=0.0.0.0
    ports:
      - "8500:8500"
    networks:
      - microservices

networks:
  microservices:
    driver: bridge
```

### Configuración de servicios en Consul
```bash
# Registrar Authors API instances
curl -X PUT http://localhost:8500/v1/agent/service/register \
  -d '{
    "ID": "authors-1",
    "Name": "authors",
    "Tags": ["api", "authors"],
    "Address": "localhost",
    "Port": 8081,
    "Check": {
      "HTTP": "http://localhost:8081/health",
      "Interval": "10s"
    }
  }'
```

## 📁 Estructura de Archivos

```
src/
├── clients/
│   ├── AuthorsClients.js     # Cliente para Authors API
│   ├── BooksClients.js       # Cliente para Books API
│   └── CustomersClients.js   # Cliente para Customers API
├── components/
│   └── HealthMonitor.vue     # Monitoreo de salud de APIs
├── config/
│   └── api.js               # Configuración global de APIs
└── views/
    ├── HomeView.vue         # Página principal con monitoreo
    ├── AuthorsPage.vue      # Gestión de autores
    ├── BooksPage.vue        # Gestión de libros
    └── CustomersPage.vue    # Gestión de clientes
```

## 🔥 Características Implementadas

### ✅ Manejo Robusto de Conexiones
- **Fallback automático** entre instancias
- **Timeout configurable** (5 segundos por defecto)
- **Reintentos inteligentes** con delay progresivo
- **Logging detallado** de todas las operaciones

### 📊 Monitoreo en Tiempo Real
- **Health checks** automáticos cada 30 segundos
- **Dashboard visual** del estado de todas las instancias
- **Alertas visuales** para servicios degradados
- **Historial de verificaciones**

### 🛠️ Métodos de API Incluidos

#### Authors API
```javascript
await AuthorsClient.getAll()
await AuthorsClient.getById(id)
await AuthorsClient.create(author)
await AuthorsClient.update(id, author)
await AuthorsClient.delete(id)
await AuthorsClient.getByBookIsbn(isbn)
await AuthorsClient.checkInstancesHealth()
```

#### Books API
```javascript
await BooksClient.getAll()
await BooksClient.getById(id)
await BooksClient.create(book)
await BooksClient.update(id, book)
await BooksClient.delete(id)
await BooksClient.getByAuthor(authorId)
await BooksClient.getByGenre(genre)
```

#### Customers API
```javascript
await CustomersClient.getAll()
await CustomersClient.getById(id)
await CustomersClient.create(customer)
await CustomersClient.update(id, customer)
await CustomersClient.delete(id)
await CustomersClient.getByStatus(status)
await CustomersClient.searchByName(name)
```

## 🚀 Cómo Ejecutar

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar Traefik y Consul
```bash
docker-compose up -d traefik consul
```

### 3. Ejecutar las APIs
```bash
# Ejemplo para Authors API en múltiples puertos
./app-authors --port 8081 &
./app-authors --port 8082 &
./app-authors --port 8083 &
```

### 4. Registrar servicios en Consul
```bash
# Script para registrar todas las instancias
chmod +x register-services.sh
./register-services.sh
```

### 5. Ejecutar el frontend
```bash
npm run serve
```

## 🔍 Monitoring y Debugging

### Logs de Conexión
El sistema genera logs detallados:
```
✅ API Success: GET http://localhost:80/authors
🔄 Trying Authors instance 2: http://localhost:8082/authors
❌ Authors instance 1 failed: Network Error
💓 Health Check Authors: 2/3 healthy
```

### Dashboard de Traefik
- **URL**: `http://localhost:8080`
- Monitorea servicios registrados en Consul
- Muestra métricas de tráfico y salud

### Consul UI
- **URL**: `http://localhost:8500`
- Gestiona registro de servicios
- Configuración de health checks

## ⚙️ Configuración Personalizada

### Cambiar URLs de Instancias
Edita el archivo `src/config/api.js`:
```javascript
INSTANCES: {
  AUTHORS: [
    'http://your-server:8081/authors',
    'http://your-server:8082/authors',
    // ...
  ]
}
```

### Ajustar Timeouts
```javascript
RETRY: {
  MAX_RETRIES: 5,           // Máximo reintentos
  RETRY_DELAY: 2000,        // Delay entre reintentos (ms)
  HEALTH_CHECK_TIMEOUT: 3000 // Timeout para health checks
}
```

## 🔧 Troubleshooting

### Problema: "All instances failed"
1. Verificar que las APIs estén ejecutándose
2. Revisar la configuración de URLs
3. Comprobar conectividad de red
4. Verificar logs en la consola del navegador

### Problema: Traefik no balancea
1. Verificar que Consul esté ejecutándose
2. Confirmar registro de servicios en Consul
3. Revisar configuración de Traefik
4. Verificar health checks en las APIs

### Problema: Health Monitor muestra todo "unhealthy"
1. Verificar CORS en las APIs
2. Confirmar que las URLs son accesibles
3. Revisar firewall y permisos de red

## 📚 Recursos Adicionales

- [Documentación de Traefik](https://doc.traefik.io/traefik/)
- [Documentación de Consul](https://www.consul.io/docs)
- [Vue.js Documentation](https://vuejs.org/)
- [Axios Documentation](https://axios-http.com/)

---

¡El sistema está listo para manejar múltiples instancias con balanceo de carga robusto! 🎉
