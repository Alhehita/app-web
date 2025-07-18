import axios from 'axios'

// Configuración de Traefik como balanceador principal
const TRAEFIK_BASE_URL = process.env.NODE_ENV === 'development' ? '' : 'http://localhost:80'

// URL de fallback directo a la instancia de books (puerto 9090)
const FALLBACK_URLS = [
  'http://localhost:9090'
]

class BooksClient {
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
      const fullUrl = `/api/books${endpoint}`
      console.log('Intentando conexión:', TRAEFIK_BASE_URL + fullUrl)
      const response = await trafikApi.request({
        url: fullUrl,
        ...options
      })
      return response.data
    } catch (trafikError) {
      console.warn('Conexión principal no disponible, intentando con instancia directa:', trafikError.message)
      
      // Fallback a instancia directa del servicio books
      for (const fallbackUrl of FALLBACK_URLS) {
        try {
          const directApi = this.createAxiosInstance(fallbackUrl)
          const fullUrl = `/books${endpoint}`
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
      
      throw new Error('Servicio de books no disponible')
    }
  }

  // Obtener todos los libros (GET /books)
  async getAll() {
    return await this.makeRequest('')
  }

  // Obtener libro por ID (GET /books/{id})
  async getById(id) {
    return await this.makeRequest(`/${id}`)
  }

  // Obtener libro por ISBN (GET /books/by-isbn/{isbn})
  async getByIsbn(isbn) {
    return await this.makeRequest(`/by-isbn/${isbn}`)
  }

  // Crear nuevo libro (POST /books)
  async create(book) {
    return await this.makeRequest('', {
      method: 'POST',
      data: book
    })
  }

  // Actualizar libro (PUT /books/{id})
  async update(id, book) {
    return await this.makeRequest(`/${id}`, {
      method: 'PUT',
      data: book
    })
  }

  // Eliminar libro (DELETE /books/{id})
  async delete(id) {
    return await this.makeRequest(`/${id}`, {
      method: 'DELETE'
    })
  }
}

export default new BooksClient()
