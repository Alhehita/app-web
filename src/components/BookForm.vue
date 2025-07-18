<template>
  <div class="book-form">
    <h2>{{ editMode ? 'Editar' : 'Agregar' }} Libro</h2>
    <form @submit.prevent="submitBook" class="form-container">
      
      <!-- Información básica del libro -->
      <div class="form-section">
        <h3>Información del Libro</h3>
        <div class="form-group">
          <label>ISBN:</label>
          <input 
            v-model="form.isbn" 
            placeholder="ISBN" 
            required 
            :disabled="editMode"
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>Título:</label>
          <input 
            v-model="form.title" 
            placeholder="Título del libro" 
            required 
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>Precio:</label>
          <input 
            v-model.number="form.price" 
            type="number" 
            step="0.01" 
            placeholder="Precio" 
            required 
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>Versión:</label>
          <input 
            v-model.number="form.version" 
            type="number" 
            placeholder="Versión" 
            required 
            class="form-input"
          />
        </div>
      </div>

      <!-- Inventario -->
      <div class="form-section">
        <h3>Inventario</h3>
        <div class="form-group">
          <label>Cantidad Vendida:</label>
          <input 
            v-model.number="form.inventorySold" 
            type="number" 
            min="0" 
            placeholder="Libros vendidos" 
            required 
            class="form-input"
          />
        </div>
        
        <div class="form-group">
          <label>Cantidad Suministrada:</label>
          <input 
            v-model.number="form.inventorySupplied" 
            type="number" 
            min="0" 
            placeholder="Libros en stock" 
            required 
            class="form-input"
          />
        </div>
      </div>

      <!-- Autores -->
      <div class="form-section">
        <h3>Autores</h3>
        <div class="authors-container">
          <!-- Selector de autores existentes -->
          <div class="author-selector-section">
            <div class="author-selector">
              <select v-model="selectedAuthorId" class="form-input">
                <option value="">Seleccionar un autor...</option>
                <option 
                  v-for="author in availableAuthors" 
                  :key="author.id" 
                  :value="author.id"
                  :disabled="isAuthorAlreadySelected(author.id)"
                >
                  {{ author.name }}
                </option>
              </select>
              <button 
                type="button" 
                @click="addExistingAuthor" 
                class="add-existing-btn"
                :disabled="!selectedAuthorId"
              >
                + Agregar
              </button>
            </div>
          </div>

          <!-- Autores seleccionados -->
          <div v-if="form.authorIds.length > 0" class="selected-authors-section">
            <h4>Autores Seleccionados ({{ form.authorIds.length }})</h4>
            <div class="selected-authors-list">
              <div 
                v-for="(authorId, index) in form.authorIds" 
                :key="'id-' + authorId" 
                class="selected-author-item"
              >
                <span class="author-info">
                  {{ getAuthorNameById(authorId) }}
                </span>
                <button 
                  type="button" 
                  @click="removeAuthorById(index)" 
                  class="remove-btn-small"
                >
                  ✖
                </button>
              </div>
            </div>
          </div>

          <!-- Mensaje si no hay autores seleccionados -->
          <div v-if="form.authorIds.length === 0" class="no-authors-message">
            <p>⚠️ Debe seleccionar al menos un autor para el libro</p>
          </div>
        </div>
      </div>

      <!-- Botones de acción -->
      <div class="form-actions">
        <button type="submit" class="save-btn">
          {{ editMode ? 'Actualizar' : 'Guardar' }} Libro
        </button>
        <button type="button" @click="clearForm" class="clear-btn">
          Limpiar
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import BooksClient from '@/clients/BooksClients.js';

export default {
  props: ['bookToEdit', 'refreshAuthors'],
  data() {
    return {
      form: {
        isbn: '',
        title: '',
        price: '',
        version: 1,
        inventorySold: 0,
        inventorySupplied: 0,
        authorIds: [] // Solo IDs de autores existentes
      },
      availableAuthors: [],
      selectedAuthorId: '',
      editMode: false
    };
  },
  async mounted() {
    await this.loadAvailableAuthors();
  },
  watch: {
    bookToEdit: {
      handler(newVal) {
        if (newVal) {
          this.form = {
            isbn: newVal.isbn || '',
            title: newVal.title || '',
            price: newVal.price || '',
            version: newVal.version || 1,
            inventorySold: newVal.inventorySold || 0,
            inventorySupplied: newVal.inventorySupplied || 0,
            authorIds: [] // Los autores existentes se cargarán al editar
          };
          this.editMode = true;
          
          // Si hay autores en el libro a editar, intentar mapearlos a IDs
          if (newVal.authors && newVal.authors.length > 0) {
            this.mapAuthorsToIds(newVal.authors);
          }
        }
      },
      immediate: true
    },
    
    refreshAuthors() {
      // Recargar autores cuando se agregue uno nuevo
      this.loadAvailableAuthors();
    }
  },
  methods: {
    async loadAvailableAuthors() {
      try {
        const response = await api.authors.getAll();
        this.availableAuthors = response.data || [];
      } catch (error) {
        console.error('Error cargando autores:', error);
        this.availableAuthors = [];
        alert('Error al cargar la lista de autores disponibles');
      }
    },

    mapAuthorsToIds(authorNames) {
      // Mapear nombres de autores a IDs cuando se edita un libro
      const authorIds = [];
      authorNames.forEach(authorName => {
        const author = this.availableAuthors.find(a => a.name === authorName);
        if (author) {
          authorIds.push(author.id);
        }
      });
      this.form.authorIds = authorIds;
    },

    addExistingAuthor() {
      if (this.selectedAuthorId && !this.isAuthorAlreadySelected(this.selectedAuthorId)) {
        this.form.authorIds.push(parseInt(this.selectedAuthorId));
        this.selectedAuthorId = '';
      }
    },

    removeAuthorById(index) {
      this.form.authorIds.splice(index, 1);
    },

    isAuthorAlreadySelected(authorId) {
      return this.form.authorIds.includes(parseInt(authorId));
    },

    getAuthorNameById(authorId) {
      const author = this.availableAuthors.find(a => a.id === authorId);
      return author ? author.name : `Autor ID ${authorId}`;
    },
    
    async submitBook() {
      try {
        // Validar campos requeridos
        if (!this.form.isbn.trim()) {
          alert('El ISBN es requerido');
          return;
        }
        
        if (!this.form.title.trim()) {
          alert('El título es requerido');
          return;
        }
        
        if (!this.form.price || this.form.price <= 0) {
          alert('El precio debe ser mayor a 0');
          return;
        }

        // Validar que al menos un autor esté seleccionado
        if (this.form.authorIds.length === 0) {
          alert('Debe seleccionar al menos un autor para el libro');
          return;
        }

        // Preparar el DTO exactamente como lo espera el backend
        const bookDto = {
          isbn: this.form.isbn.trim(),
          title: this.form.title.trim(),
          price: parseFloat(this.form.price),
          version: parseInt(this.form.version) || 1,
          inventorySold: parseInt(this.form.inventorySold) || 0,
          inventorySupplied: parseInt(this.form.inventorySupplied) || 0,
          authorIds: this.form.authorIds // Solo enviar IDs de autores existentes
        };

        console.log('Enviando datos al backend:', bookDto);

        if (this.editMode) {
          // Para actualizar libro
          const response = await BooksClient.update(this.form.id, bookDto);
          console.log('Libro actualizado:', response);
          alert('Libro actualizado exitosamente');
        } else {
          // Para crear nuevo libro
          const response = await BooksClient.create(bookDto);
          console.log('Libro creado:', response);
          alert('Libro agregado exitosamente');
        }
        
        this.clearForm();
        this.$emit('refresh-books');
        
      } catch (error) {
        console.error('Error al guardar libro:', error);
        
        if (error.response) {
          // El servidor respondió con un código de error
          switch (error.response.status) {
            case 400:
              alert('Error: Datos inválidos. Verifique que el ISBN no esté duplicado y que todos los campos sean correctos.');
              break;
            case 500:
              alert('Error interno del servidor. Intente nuevamente.');
              break;
            default:
              alert(`Error del servidor: ${error.response.status}`);
          }
        } else if (error.request) {
          // La petición fue hecha pero no se recibió respuesta
          alert('Error de conexión. Verifique que el servidor esté funcionando.');
        } else {
          // Algo más pasó al configurar la petición
          alert('Error inesperado: ' + error.message);
        }
      }
    },
    
    clearForm() {
      this.form = {
        isbn: '',
        title: '',
        price: '',
        version: 1,
        inventorySold: 0,
        inventorySupplied: 0,
        authorIds: []
      };
      this.selectedAuthorId = '';
      this.editMode = false;
      this.$emit('clear-edit');
    }
  }
};
</script>

<style scoped>
.book-form {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.book-form h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  border-bottom: 3px solid #007bff;
  padding-bottom: 10px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.form-section {
  background: white;
  padding: 20px;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #495057;
  font-size: 18px;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 12px 15px;
  border: 2px solid #e9ecef;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0,123,255,0.1);
}

.form-input:disabled {
  background-color: #f8f9fa;
  color: #6c757d;
  cursor: not-allowed;
}

.authors-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.author-selector-section {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  border: 1px solid #e9ecef;
}

.author-selector {
  display: flex;
  gap: 10px;
  align-items: center;
}

.author-selector select {
  flex: 1;
}

.add-existing-btn {
  background: #28a745;
  color: white;
  border: none;
  padding: 12px 16px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  transition: background-color 0.3s ease;
}

.add-existing-btn:hover:not(:disabled) {
  background: #218838;
}

.add-existing-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.selected-authors-section {
  background: #e8f5e8;
  padding: 15px;
  border-radius: 5px;
  border: 1px solid #c3e6c3;
}

.selected-authors-section h4 {
  margin: 0 0 15px 0;
  color: #155724;
  font-size: 16px;
  font-weight: 600;
}

.selected-authors-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.selected-author-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 12px 15px;
  border-radius: 4px;
  border: 1px solid #c3e6c3;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.author-info {
  font-weight: 500;
  color: #495057;
}

.remove-btn-small {
  background: #dc3545;
  color: white;
  border: none;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease;
}

.remove-btn-small:hover {
  background: #c82333;
}

.no-authors-message {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 5px;
  padding: 15px;
  text-align: center;
}

.no-authors-message p {
  margin: 0;
  color: #856404;
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  padding: 20px 0;
}

.save-btn {
  background: #007bff;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.save-btn:hover {
  background: #0056b3;
}

.clear-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.clear-btn:hover {
  background: #545b62;
}

/* Responsive design */
@media (max-width: 768px) {
  .book-form {
    margin: 10px;
    padding: 15px;
  }
  
  .author-selector {
    flex-direction: column;
    align-items: stretch;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .save-btn, .clear-btn {
    width: 100%;
  }
}

/* Animaciones */
.form-section {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
