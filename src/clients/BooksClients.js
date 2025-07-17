import axios from 'axios';

// Configuración base para todas las APIs
// En desarrollo, usar proxy configurado en vue.config.js
const API_BASE_URL = process.env.NODE_ENV === 'development' ? '/api' : 'http://localhost';

// Crear instancias de axios para diferentes servicios
const apiBooks = axios.create({
  baseURL: `${API_BASE_URL}/books`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const apiAuthors = axios.create({
  baseURL: `${API_BASE_URL}/authors`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

const apiInventory = axios.create({
  baseURL: `${API_BASE_URL}/inventory`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptores para manejo de errores global
const setupInterceptors = (apiInstance, serviceName) => {
  // Request interceptor
  apiInstance.interceptors.request.use(
    (config) => {
      console.log(`[${serviceName}] Request:`, config.method.toUpperCase(), config.url);
      return config;
    },
    (error) => {
      console.error(`[${serviceName}] Request Error:`, error);
      return Promise.reject(error);
    }
  );

  // Response interceptor
  apiInstance.interceptors.response.use(
    (response) => {
      console.log(`[${serviceName}] Response:`, response.status, response.config.url);
      return response;
    },
    (error) => {
      const status = error.response?.status;
      const url = error.config?.url;
      console.error(`[${serviceName}] Response Error:`, status, url, error.message);
      
      // Manejo global de errores
      if (status === 404) {
        console.warn(`[${serviceName}] Recurso no encontrado: ${url}`);
      } else if (status === 500) {
        console.error(`[${serviceName}] Error interno del servidor: ${url}`);
      } else if (status === 400) {
        console.warn(`[${serviceName}] Solicitud inválida: ${url}`);
      }
      
      return Promise.reject(error);
    }
  );
};

// Configurar interceptores para cada API
setupInterceptors(apiBooks, 'Books');
setupInterceptors(apiAuthors, 'Authors');
setupInterceptors(apiInventory, 'Inventory');

// === SERVICIOS DE LIBROS ===
export const booksService = {
  // Obtener todos los libros
  getAll: () => apiBooks.get(''),
  
  // Obtener libro por ISBN
  getByIsbn: (isbn) => apiBooks.get(`/${isbn}`),
  
  // Crear nuevo libro
  create: (bookData) => apiBooks.post('', bookData),
  
  // Actualizar libro
  update: (isbn, bookData) => apiBooks.put(`/${isbn}`, bookData),
  
  // Eliminar libro
  delete: (isbn) => apiBooks.delete(`/${isbn}`),
  
  // Ping para verificar conexión
  ping: () => apiBooks.get('/ping'),
  
  // Buscar libros (si tienes endpoint de búsqueda)
  search: (query) => apiBooks.get(`/search?q=${encodeURIComponent(query)}`)
};

// === SERVICIOS DE AUTORES ===
export const authorsService = {
  // Obtener todos los autores
  getAll: () => apiAuthors.get(''),
  
  // Obtener autor por ID
  getById: (id) => apiAuthors.get(`/${id}`),
  
  // Crear nuevo autor
  create: (authorData) => apiAuthors.post('', authorData),
  
  // Actualizar autor
  update: (id, authorData) => apiAuthors.put(`/${id}`, authorData),
  
  // Eliminar autor
  delete: (id) => apiAuthors.delete(`/${id}`),
  
  // Obtener autores por libro
  getByBook: (isbn) => apiAuthors.get(`/book/${isbn}`),
  
  // Asociar autor a libro
  associateToBook: (isbn, authorId) => apiAuthors.post(`/associate/${isbn}/${authorId}`),
  
  // Desasociar autor de libro
  disassociateFromBook: (isbn, authorId) => apiAuthors.delete(`/associate/${isbn}/${authorId}`)
};

// === SERVICIOS DE INVENTARIO ===
export const inventoryService = {
  // Obtener todo el inventario
  getAll: () => apiInventory.get(''),
  
  // Obtener inventario por ISBN
  getByIsbn: (isbn) => apiInventory.get(`/${isbn}`),
  
  // Crear entrada de inventario
  create: (inventoryData) => apiInventory.post('', inventoryData),
  
  // Actualizar inventario
  update: (isbn, inventoryData) => apiInventory.put(`/${isbn}`, inventoryData),
  
  // Eliminar entrada de inventario
  delete: (isbn) => apiInventory.delete(`/${isbn}`)
};

// === SERVICIO UNIFICADO ===
export const api = {
  books: booksService,
  authors: authorsService,
  inventory: inventoryService,
  
  // Métodos de utilidad
  utils: {
    // Verificar conectividad de todos los servicios
    async checkHealth() {
      const results = {};
      
      try {
        await booksService.ping();
        results.books = 'OK';
      } catch (error) {
        results.books = 'ERROR';
      }
      
      try {
        await authorsService.getAll();
        results.authors = 'OK';
      } catch (error) {
        results.authors = 'ERROR';
      }
      
      try {
        await inventoryService.getAll();
        results.inventory = 'OK';
      } catch (error) {
        results.inventory = 'ERROR';
      }
      
      return results;
    },
    
    // Configurar base URL dinámicamente
    setBaseUrl(newBaseUrl) {
      apiBooks.defaults.baseURL = `${newBaseUrl}/books`;
      apiAuthors.defaults.baseURL = `${newBaseUrl}/API/v1.0/authors`;
      apiInventory.defaults.baseURL = `${newBaseUrl}/inventory`;
    }
  }
};

// Exportaciones de compatibilidad hacia atrás
export { apiBooks, apiAuthors };

// Exportación por defecto
export default api;
