import axios from 'axios'

// Configuración de Traefik como balanceador principal
const TRAEFIK_BASE_URL = 'http://localhost:80'

// URL de fallback directo a la instancia de authors (puerto 8081)
const FALLBACK_URLS = [
  'http://localhost:8081/API/v1.0'
]

class AuthorsClient {
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
    // Intentar con Traefik primero
    try {
      const trafikApi = this.createAxiosInstance(TRAEFIK_BASE_URL)
      const fullUrl = `/api/authors${endpoint}`
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
          const fullUrl = `/authors${endpoint}`
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
      
      throw new Error('Servicio de authors no disponible')
    }
  }

  // Obtener todos los autores con sus libros (GET /authors)
  async getAll() {
    return await this.makeRequest('')
  }

  // Obtener autor por ID con sus libros (GET /authors/{id})
  async getById(id) {
    return await this.makeRequest(`/${id}`)
  }

  // Crear nuevo autor (POST /authors)
  async create(author) {
    return await this.makeRequest('', {
      method: 'POST',
      data: author
    })
  }

  // Actualizar autor (PUT /authors/{id})
  async update(id, author) {
    return await this.makeRequest(`/${id}`, {
      method: 'PUT',
      data: author
    })
  }

  // Eliminar autor (DELETE /authors/{id})
  async delete(id) {
    return await this.makeRequest(`/${id}`, {
      method: 'DELETE'
    })
  }

  // Obtener autores por ISBN de libro (GET /authors/by-book/{isbn})
  async getByBookIsbn(isbn) {
    return await this.makeRequest(`/by-book/${isbn}`)
  }
}

export default new AuthorsClient()
