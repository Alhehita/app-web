<template>
  <div class="books-page">
    <div class="page-header">
      <h1 class="page-title">Gestión de Libros</h1>
      <p class="page-subtitle">Administra el catálogo de libros</p>
    </div>
    
    <div class="content-container">
      <div class="actions-bar">
        <button class="btn btn-primary" @click="showCreateForm = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Nuevo Libro
        </button>
      </div>
      
      <div class="books-grid" v-if="books.length > 0">
        <div class="book-card" v-for="book in books" :key="book.id">
          <div class="book-cover">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
            </svg>
          </div>
          <div class="book-info">
            <h3 class="book-title">{{ book.title }}</h3>
            <p class="book-isbn">ISBN: {{ book.isbn }}</p>
            <div class="book-meta">
              <span class="book-id">ID: {{ book.id }}</span>
              <span class="book-version">v{{ book.version }}</span>
            </div>
            <p class="book-price">${{ book.price }}</p>
          </div>
          <div class="book-actions">
            <button class="btn btn-secondary" @click="editBook(book)">Editar</button>
            <button class="btn btn-danger" @click="deleteBook(book.id)">Eliminar</button>
          </div>
        </div>
      </div>
      
      <!-- Formulario de Crear/Editar Libro -->
      <div v-if="showCreateForm || editingBook" class="modal-overlay" @click="closeForm">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ editingBook ? 'Editar Libro' : 'Crear Nuevo Libro' }}</h2>
            <button class="close-btn" @click="closeForm">×</button>
          </div>
          <form @submit.prevent="submitForm" class="book-form">
            <div class="form-group">
              <label for="title">Título del Libro *</label>
              <input 
                type="text" 
                id="title" 
                v-model="formData.title" 
                required 
                placeholder="Ingresa el título del libro"
                :disabled="loading"
              />
            </div>
            <div class="form-group">
              <label for="isbn">ISBN *</label>
              <input 
                type="text" 
                id="isbn" 
                v-model="formData.isbn" 
                required 
                placeholder="Ej: 978-0-06-088328-7"
                :disabled="loading"
              />
            </div>
            <div class="form-group">
              <label for="price">Precio *</label>
              <input 
                type="number" 
                id="price" 
                v-model.number="formData.price" 
                required 
                min="0"
                step="0.01"
                placeholder="Precio del libro"
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
                placeholder="Versión del libro (ej: 1)"
                :disabled="loading"
              />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeForm" :disabled="loading">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
                <span v-if="loading">Guardando...</span>
                <span v-else>{{ editingBook ? 'Actualizar' : 'Crear' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div class="empty-state" v-else>
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
        </svg>
        <h3>No hay libros registrados</h3>
        <p>Comienza agregando el primer libro al catálogo</p>
      </div>
    </div>
  </div>
</template>

<script>
import BooksClient from '@/clients/BooksClients.js'

export default {
  name: 'BooksPage',
  data() {
    return {
      books: [],
      showCreateForm: false,
      editingBook: null,
      loading: false,
      formData: {
        title: '',
        isbn: '',
        price: 0,
        version: 1
      }
    }
  },
  computed: {
    isFormValid() {
      return this.formData.title.trim() && 
             this.formData.isbn.trim() && 
             this.formData.price > 0 && 
             this.formData.version >= 1
    }
  },
  async mounted() {
    await this.loadBooks()
  },
  methods: {
    async loadBooks() {
      try {
        this.loading = true
        this.books = await BooksClient.getAll()
      } catch (error) {
        console.error('Error loading books:', error)
        // Datos de ejemplo mientras no haya backend conectado
        this.books = [
          {
            id: 1,
            title: 'Cien años de soledad',
            isbn: '978-0-06-088328-7',
            version: 1,
            price: 25.99
          },
          {
            id: 2,
            title: 'La casa de los espíritus',
            isbn: '978-0-553-38391-7',
            version: 1,
            price: 22.50
          },
          {
            id: 3,
            title: 'El amor en los tiempos del cólera',
            isbn: '978-0-307-38973-9',
            version: 2,
            price: 24.99
          },
          {
            id: 4,
            title: 'Rayuela',
            isbn: '978-84-376-0494-7',
            version: 1,
            price: 28.50
          }
        ]
      } finally {
        this.loading = false
      }
    },

    editBook(book) {
      this.editingBook = { ...book }
      this.formData.title = book.title
      this.formData.isbn = book.isbn
      this.formData.price = book.price
      this.formData.version = book.version || 1
      this.showCreateForm = false
    },

    async deleteBook(id) {
      if (confirm('¿Estás seguro de que quieres eliminar este libro?')) {
        try {
          this.loading = true
          await BooksClient.delete(id)
          await this.loadBooks()
        } catch (error) {
          console.error('Error deleting book:', error)
          alert('Error al eliminar el libro')
        } finally {
          this.loading = false
        }
      }
    },

    async submitForm() {
      if (!this.isFormValid) return

      try {
        this.loading = true
        
        if (this.editingBook) {
          // Actualizar libro existente
          await BooksClient.update(this.editingBook.id, {
            title: this.formData.title.trim(),
            isbn: this.formData.isbn.trim(),
            price: this.formData.price,
            version: this.formData.version
          })
        } else {
          // Crear nuevo libro
          await BooksClient.create({
            title: this.formData.title.trim(),
            isbn: this.formData.isbn.trim(),
            price: this.formData.price,
            version: this.formData.version
          })
        }
        
        await this.loadBooks()
        this.closeForm()
      } catch (error) {
        console.error('Error saving book:', error)
        alert('Error al guardar el libro. Por favor intenta de nuevo.')
      } finally {
        this.loading = false
      }
    },

    closeForm() {
      this.showCreateForm = false
      this.editingBook = null
      this.formData.title = ''
      this.formData.isbn = ''
      this.formData.price = 0
      this.formData.version = 1
      this.loading = false
    }
  }
}
</script>

<style scoped>
.books-page {
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

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.book-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.book-card:hover {
  transform: translateY(-4px);
}

.book-cover {
  margin-bottom: 1rem;
  color: #667eea;
}

.book-title {
  color: #2c3e50;
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
}

.book-isbn {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  font-family: monospace;
}

.book-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.book-id {
  color: #6c757d;
  font-size: 0.9rem;
  font-family: monospace;
}

.book-version {
  background: rgba(102, 126, 234, 0.1);
  color: #667eea;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.book-price {
  color: #dc3545;
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

.book-actions {
  display: flex;
  gap: 0.5rem;
  width: 100%;
}

.book-actions .btn {
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  flex: 1;
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

/* Estilos del modal y formulario */
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
}

.modal-content {
  background: white;
  border-radius: 12px;
  padding: 0;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #f8f9fa;
}

.book-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-group input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

@media (max-width: 768px) {
  .books-page {
    padding: 1rem;
  }
  
  .books-grid {
    grid-template-columns: 1fr;
  }
  
  .book-actions {
    flex-direction: column;
  }
}
</style>
