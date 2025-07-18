import axios from 'axios'

// Configuración de Traefik como balanceador principal
const TRAEFIK_BASE_URL = 'http://localhost:80'

// URL de fallback directo a la instancia de authors (puerto 8081)
const FALLBACK_URLS = [
  'http://localhost:8081' // Puerto directo del servicio authors
]

class AuthorsClient {
  constructor() {
    this.timeout = 5000 // 5 segundos
    this.maxRetries = 3 // Número máximo de reintentos para el endpoint con errores
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
      const fullUrl = `/app-authors/authors` // Usar el prefijo de Traefik
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
          const fullUrl = `/authors${endpoint}` // Path directo del controller
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

  // Obtener autores por ISBN de libro (GET /authors/find/{isbn})
  // Este endpoint puede generar errores intencionalmente, por lo que usa reintentos
  async getByBookIsbn(isbn) {
    return await this.makeRequestWithRetry(`/find/${isbn}`)
  }
}

export default new AuthorsClient()
