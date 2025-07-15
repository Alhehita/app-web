import axios from 'axios'

// Configuración de Traefik como balanceador principal
const TRAEFIK_BASE_URL = 'http://localhost:80'

// URL de fallback directo a la instancia de books (puerto 8082)
const FALLBACK_URLS = [
  'http://localhost:8082/API/v1.0'
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
    // Intentar con Traefik primero
    try {
      const trafikApi = this.createAxiosInstance(TRAEFIK_BASE_URL)
      const response = await trafikApi.request({
        url: `/api/books${endpoint}`,
        ...options
      })
      return response.data
    } catch (trafikError) {
      console.warn('Traefik no disponible, intentando con instancia directa:', trafikError.message)
      
      // Fallback a instancia directa del servicio books
      for (const fallbackUrl of FALLBACK_URLS) {
        try {
          const directApi = this.createAxiosInstance(fallbackUrl)
          const response = await directApi.request({
            url: `/books${endpoint}`,
            ...options
          })
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

  // Obtener libros por ISBN (GET /books/by-isbn/{isbn})
  async getByIsbn(isbn) {
    return await this.makeRequest(`/by-isbn/${isbn}`)
  }
}

export default new BooksClient()
