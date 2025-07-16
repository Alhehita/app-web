// Configuración global de APIs
export const API_CONFIG = {
  // Configuración de Traefik (Load Balancer)
  TRAEFIK: {
    BASE_URL: 'http://localhost:80',
    TIMEOUT: 5000
  },
  
  // Configuración de instancias directas para fallback
  INSTANCES: {
    AUTHORS: [
      'http://localhost:8081/authors',
      'http://localhost:8082/authors',
      'http://localhost:8083/authors'
    ],
    BOOKS: [
      'http://localhost:8084/books',
      'http://localhost:8085/books',
      'http://localhost:8086/books'
    ],
    CUSTOMERS: [
      'http://localhost:8087/customers',
      'http://localhost:8088/customers',
      'http://localhost:8089/customers'
    ]
  },
  
  // Configuración de reintentos y timeouts
  RETRY: {
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000, // ms
    HEALTH_CHECK_TIMEOUT: 2000 // ms
  },
  
  // Headers comunes
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}

// Configuración para desarrollo vs producción
export const getAPIConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  if (isDevelopment) {
    return {
      ...API_CONFIG,
      // En desarrollo, puedes usar diferentes puertos o URLs
      TRAEFIK: {
        ...API_CONFIG.TRAEFIK,
        BASE_URL: 'http://localhost:80' // Traefik en desarrollo
      }
    }
  } else {
    return {
      ...API_CONFIG,
      // En producción, usar URLs de producción
      TRAEFIK: {
        ...API_CONFIG.TRAEFIK,
        BASE_URL: 'https://your-production-domain.com' // Cambiar por tu dominio de producción
      }
    }
  }
}

// Utilidades para logging y monitoreo
export const API_UTILS = {
  logRequest: (method, url, data = null) => {
    console.log(`🚀 API Request: ${method.toUpperCase()} ${url}`, data || '')
  },
  
  logSuccess: (method, url, response) => {
    console.log(`✅ API Success: ${method.toUpperCase()} ${url}`, response.status)
  },
  
  logError: (method, url, error) => {
    console.error(`❌ API Error: ${method.toUpperCase()} ${url}`, error.message)
  },
  
  logFallback: (service, instance, url) => {
    console.warn(` Fallback: ${service} instance ${instance} - ${url}`)
  },
  
  logHealthCheck: (service, results) => {
    const healthy = results.filter(r => r.status === 'healthy').length
    const total = results.length
    console.log(`💓 Health Check ${service}: ${healthy}/${total} healthy`)
  }
}
