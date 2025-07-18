import axios from 'axios'

// Configuración de Traefik como balanceador principal
const TRAEFIK_BASE_URL = process.env.NODE_ENV === 'development' ? '' : 'http://localhost:80'

// URL de fallback directo a la instancia de customers (puerto 8083)
const FALLBACK_URLS = [
  'http://localhost:7070'
]

class CustomersClient {
  constructor() {
    this.timeout = 5000 // 5 segundos
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

  // Método principal que intenta Traefik primero, luego fallback
  async makeRequest(endpoint, options = {}) {
    // Intentar con Traefik primero (o proxy en desarrollo)
    try {
      const trafikApi = this.createAxiosInstance(TRAEFIK_BASE_URL)
      const fullUrl = `/api/customers${endpoint}`
      console.log('Intentando conexión:', TRAEFIK_BASE_URL + fullUrl)
      const response = await trafikApi.request({
        url: fullUrl,
        ...options
      })
      return response.data
    } catch (trafikError) {
      console.warn('Conexión principal no disponible, intentando con instancia directa:', trafikError.message)
      
      // Fallback a instancia directa del servicio customers
      for (const fallbackUrl of FALLBACK_URLS) {
        try {
          const directApi = this.createAxiosInstance(fallbackUrl)
          const fullUrl = `/customers${endpoint}`
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

  // Obtener todos los clientes (GET /customers)
  async getAll() {
    return await this.makeRequest('')
  }

  // Obtener cliente por ID (GET /customers/{id})
  async getById(id) {
    return await this.makeRequest(`/${id}`)
  }

  // Crear nuevo cliente (POST /customers)
  async create(customer) {
    return await this.makeRequest('', {
      method: 'POST',
      data: customer
    })
  }

  // Actualizar cliente (PUT /customers/{id})
  async update(id, customer) {
    return await this.makeRequest(`/${id}`, {
      method: 'PUT',
      data: customer
    })
  }

  // Eliminar cliente (DELETE /customers/{id})
  async delete(id) {
    return await this.makeRequest(`/${id}`, {
      method: 'DELETE'
    })
  }

  // Obtener cliente por email (GET /customers/by-email/{email})
  async getByEmail(email) {
    return await this.makeRequest(`/by-email/${encodeURIComponent(email)}`)
  }
}

export default new CustomersClient()
