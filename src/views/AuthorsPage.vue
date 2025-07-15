<template>
  <div class="authors-page">
    <div class="page-header">
      <h1 class="page-title">Gestión de Autores</h1>
      <p class="page-subtitle">Administra la información de los autores</p>
    </div>
    
    <div class="content-container">
      <div class="actions-bar">
        <button class="btn btn-primary" @click="showCreateForm = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Nuevo Autor
        </button>
      </div>
      
      <!-- Formulario de Crear/Editar Autor -->
      <div v-if="showCreateForm || editingAuthor" class="modal-overlay" @click="closeForm">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ editingAuthor ? 'Editar Autor' : 'Crear Nuevo Autor' }}</h2>
            <button class="close-btn" @click="closeForm">×</button>
          </div>
          <form @submit.prevent="submitForm" class="author-form">
            <div class="form-group">
              <label for="name">Nombre del Autor *</label>
              <input 
                type="text" 
                id="name" 
                v-model="formData.name" 
                required 
                placeholder="Ingresa el nombre completo del autor"
                :disabled="loading"
              />
            </div>
            <div class="form-group">
              <label for="version">Versión *</label>
              <input 
                type="number" 
                id="version" 
                v-model.number="formData.version" 
                required 
                min="1"
                placeholder="Versión del autor (ej: 1)"
                :disabled="loading"
              />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeForm" :disabled="loading">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading || !formData.name.trim() || !formData.version">
                <span v-if="loading">Guardando...</span>
                <span v-else>{{ editingAuthor ? 'Actualizar' : 'Crear' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div class="authors-grid" v-if="authors.length > 0">
        <div class="author-card" v-for="author in authors" :key="author.id">
          <div class="author-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="author-info">
            <h3 class="author-name">{{ author.name }}</h3>
            <div class="author-meta">
              <span class="author-id">ID: {{ author.id }}</span>
              <span class="author-version">v{{ author.version }}</span>
            </div>
            <div v-if="author.books && author.books.length > 0" class="author-books">
              <h4>Libros:</h4>
              <ul class="books-list">
                <li v-for="book in author.books" :key="book.isbn">
                  {{ book.title }} ({{ book.isbn }})
                </li>
              </ul>
            </div>
            <div v-else class="no-books">
              <span>Sin libros publicados</span>
            </div>
          </div>
          <div class="author-actions">
            <button class="btn btn-secondary" @click="editAuthor(author)">Editar</button>
            <button class="btn btn-danger" @click="deleteAuthor(author.id)">Eliminar</button>
          </div>
        </div>
      </div>
      
      <div class="empty-state" v-else>
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <h3>No hay autores registrados</h3>
        <p>Comienza agregando el primer autor</p>
      </div>
    </div>
  </div>
</template>

<script>
import AuthorsClient from '@/clients/AuthorsClients.js'

export default {
  name: 'AuthorsPage',
  data() {
    return {
      authors: [],
      showCreateForm: false,
      editingAuthor: null,
      loading: false,
      formData: {
        name: '',
        version: 1
      }
    }
  },
  async mounted() {
    await this.loadAuthors()
  },
  methods: {
    async loadAuthors() {
      try {
        this.loading = true
        this.authors = await AuthorsClient.getAll()
      } catch (error) {
        console.error('Error loading authors:', error)
        // Datos de ejemplo mientras no haya backend conectado
        this.authors = [
          {
            id: 1,
            name: 'Gabriel García Márquez',
            version: 1,
            books: [
              { title: 'Cien años de soledad', isbn: '978-84-376-0494-7' },
              { title: 'El amor en los tiempos del cólera', isbn: '978-84-376-0495-4' }
            ]
          },
          {
            id: 2,
            name: 'Isabel Allende',
            version: 2,
            books: [
              { title: 'La casa de los espíritus', isbn: '978-84-204-8207-5' }
            ]
          },
          {
            id: 3,
            name: 'Mario Vargas Llosa',
            version: 1,
            books: []
          },
          {
            id: 4,
            name: 'Octavio Paz',
            version: 1,
            books: [
              { title: 'El laberinto de la soledad', isbn: '978-607-11-0371-5' }
            ]
          }
        ]
      } finally {
        this.loading = false
      }
    },

    editAuthor(author) {
      this.editingAuthor = { ...author }
      this.formData.name = author.name
      this.formData.version = author.version || 1
      this.showCreateForm = false
    },

    async deleteAuthor(id) {
      if (confirm('¿Estás seguro de que quieres eliminar este autor?')) {
        try {
          this.loading = true
          await AuthorsClient.delete(id)
          await this.loadAuthors()
        } catch (error) {
          console.error('Error deleting author:', error)
          // Fallback para demo
          this.authors = this.authors.filter(author => author.id !== id)
        } finally {
          this.loading = false
        }
      }
    },

    async submitForm() {
      if (!this.formData.name.trim()) return

      try {
        this.loading = true
        
        if (this.editingAuthor) {
          // Actualizar autor existente
          await AuthorsClient.update(this.editingAuthor.id, {
            name: this.formData.name.trim(),
            version: this.formData.version
          })
        } else {
          // Crear nuevo autor
          await AuthorsClient.create({
            name: this.formData.name.trim(),
            version: this.formData.version
          })
        }
        
        await this.loadAuthors()
        this.closeForm()
      } catch (error) {
        console.error('Error saving author:', error)
        alert('Error al guardar el autor. Por favor intenta de nuevo.')
      } finally {
        this.loading = false
      }
    },

    closeForm() {
      this.showCreateForm = false
      this.editingAuthor = null
      this.formData.name = ''
      this.formData.version = 1
      this.loading = false
    }
  }
}
</script>

<style scoped>
.authors-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  color: #6c757d;
  font-size: 1.1rem;
}

.actions-bar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 2rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.authors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.author-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.author-card:hover {
  transform: translateY(-4px);
}

.author-name {
  color: #2c3e50;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

.author-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.author-id {
  color: #6c757d;
  font-size: 0.9rem;
  font-family: monospace;
}

.author-version {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.author-actions {
  display: flex;
  gap: 0.5rem;
}

.author-actions .btn {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  transform: translateY(0);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #6c757d;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f8f9fa;
  color: #dc3545;
}

/* Form styles */
.author-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #2c3e50;
  font-size: 1rem;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 1rem;
}

.form-actions .btn {
  padding: 0.75rem 1.5rem;
  min-width: 100px;
}

/* Author card improvements */
.author-avatar {
  margin-bottom: 1rem;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  border-radius: 50%;
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.author-books {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.author-books h4 {
  color: #2c3e50;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.books-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.books-list li {
  background: rgba(102, 126, 234, 0.05);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.25rem;
  font-size: 0.85rem;
  color: #495057;
}

.no-books {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
  color: #6c757d;
  font-style: italic;
  font-size: 0.9rem;
}

/* Loading state */
.loading-state {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .authors-page {
    padding: 1rem;
  }
  
  .authors-grid {
    grid-template-columns: 1fr;
  }
  
  .author-actions {
    flex-direction: column;
  }
}
</style>
