import axios from 'axios'

// Configuración de Traefik como balanceador principal
const TRAEFIK_BASE_URL = 'http://localhost:80'

// URL de fallback directo a la instancia de authors (puerto 8081)
const FALLBACK_URLS = [
  'http://localhost:7070' // Puerto directo del servicio customers
]

class CustomersClient {
  constructor() {
    this.timeout = 10000 // 10 segundos
    this.maxRetries = 3 // Número máximo de reintentos para el endpoint con errores
  }

  // Obtener todas las órdenes (GET /customers)
  async getAll() {
    return await this.makeRequest('')
  }

  // Crear instancia de axios con configuración
  createAxiosInstance(baseURL) {
    return axios.create({
      baseURL,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }

  // Método para manejar reintentos específicos para el endpoint problemático
  async makeRequestWithRetry(endpoint, options = {}) {
    let lastError = null
    
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Intento ${attempt} para endpoint: ${endpoint}`)
        return await this.makeRequest(endpoint, options)
      } catch (error) {
        lastError = error
        console.warn(`Intento ${attempt} falló:`, error.message)
        
        if (attempt < this.maxRetries) {
          // Esperar un poco antes del siguiente intento
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt))
        }
      }
    }
    
    throw lastError
  }

  // Método principal que intenta Traefik primero, luego fallback
  async makeRequest(endpoint, options = {}) {
    // Intentar con Traefik primero usando el prefijo configurado
    try {
      const trafikApi = this.createAxiosInstance(TRAEFIK_BASE_URL)
      const fullUrl = `/app-customers/orders` // Usar el prefijo de Traefik
      console.log('Intentando Traefik:', TRAEFIK_BASE_URL + fullUrl)
      const response = await trafikApi.request({
        url: fullUrl,
        ...options
      })
      return response.data
    } catch (trafikError) {
      console.warn('Traefik no disponible, intentando con instancia directa:', trafikError.message)
      
      // Fallback a instancia directa del servicio authors
      for (const fallbackUrl of FALLBACK_URLS) {
        try {
          const directApi = this.createAxiosInstance(fallbackUrl)
          const fullUrl = `/orders${endpoint}` // Path directo del controller
          console.log('Intentando fallback:', fallbackUrl + fullUrl)
          const response = await directApi.request({
            url: fullUrl,
            ...options
          })
          console.log('Respuesta exitosa desde:', fallbackUrl + fullUrl)
          return response.data
        } catch (error) {
          console.warn(`Instancia ${fallbackUrl} no disponible:`, error.message)
          continue
        }
      }
      throw new Error('Servicio de customers no disponible')
    }
  }

  // Obtener todos los pedidos de un cliente (GET /orders/customer/{customerId})
  async getAllByCustomerId(customerId) {
    return await this.makeRequest(`/customer/${customerId}`)
  }

  // Obtener detalle de una orden por ID (GET /orders/{orderId})
  async getById(orderId) {
    return await this.makeRequest(`/${orderId}`)
  }

  // Crear una nueva orden (POST /orders)
  async create(order) {
    return await this.makeRequest('', {
      method: 'POST',
      data: order
    })
  }

  // Actualizar orden (PUT /orders/{orderId})
  async update(orderId, order) {
    return await this.makeRequest(`/${orderId}`, {
      method: 'PUT',
      data: order
    })
  }

  // Eliminar orden (DELETE /orders/{orderId})
  async delete(orderId) {
    return await this.makeRequest(`/${orderId}`, {
      method: 'DELETE'
    })
  }
}

export default new CustomersClient()
