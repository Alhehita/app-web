import axios from 'axios'

// Configuración de la API de customers
const API_BASE_URL = 'http://localhost'

// URL de fallback directo a la instancia de customers
const FALLBACK_URLS = [
  'http://localhost:8083/API/v1.0'
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

  // Método principal que intenta la API directamente
  async makeRequest(endpoint, options = {}) {
    // Intentar con la API principal primero
    try {
      const apiInstance = this.createAxiosInstance(API_BASE_URL)
      const response = await apiInstance.request({
        url: `/customers${endpoint}`,
        ...options
      })
      return response.data
    } catch (apiError) {
      console.warn('API principal no disponible, intentando con instancia directa:', apiError.message)
      
      // Fallback a instancia directa del servicio customers
      for (const fallbackUrl of FALLBACK_URLS) {
        try {
          const directApi = this.createAxiosInstance(fallbackUrl)
          const response = await directApi.request({
            url: `/customers${endpoint}`,
            ...options
          })
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
    return await this.makeRequest(`/by-email/${email}`)
  }
}

export default new CustomersClient()
