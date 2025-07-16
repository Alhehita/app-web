<template>
  <div class="authors-manager">
    <h3> Gestión de Autores</h3>
    
    <!-- Formulario para agregar nuevo autor -->
    <div class="add-author-section">
      <div class="form-row">
        <input 
          v-model="newAuthorName" 
          placeholder="Nombre del nuevo autor" 
          @keyup.enter="addAuthor"
          class="author-input"
        />
        <button 
          @click="addAuthor" 
          class="add-author-btn"
          :disabled="!newAuthorName.trim()"
        >
          Agregar Autor
        </button>
      </div>
    </div>
    
    <!-- Lista de autores existentes -->
    <div v-if="authors.length > 0" class="authors-list">
      <h4>Autores disponibles en la base de datos ({{ authors.length }}):</h4>
      <div class="authors-grid">
        <span 
          v-for="author in authors" 
          :key="author.id" 
          class="author-chip"
        >
          {{ author.name }}
        </span>
      </div>
    </div>
    
    <!-- Mensaje si no hay autores -->
    <div v-else class="no-authors">
      <p>⚠️ No hay autores en la base de datos. Agregue algunos autores antes de crear libros.</p>
    </div>
  </div>
</template>

<script>
import { api } from '@/clients/BooksClients.js';

export default {
  name: 'AuthorsManager',
  data() {
    return {
      newAuthorName: '',
      authors: []
    };
  },
  async mounted() {
    await this.loadAuthors();
  },
  methods: {
    async loadAuthors() {
      try {
        const response = await api.authors.getAll();
        this.authors = response.data || [];
      } catch (error) {
        console.error('Error cargando autores:', error);
        this.authors = [];
      }
    },
    
    async addAuthor() {
      const name = this.newAuthorName.trim();
      if (!name) {
        alert('Por favor ingrese un nombre para el autor');
        return;
      }

      // Verificar si el autor ya existe
      const existingAuthor = this.authors.find(author => 
        author.name.toLowerCase() === name.toLowerCase()
      );
      
      if (existingAuthor) {
        alert('Este autor ya existe en la base de datos');
        return;
      }

      try {
        const response = await api.authors.create({ name: name });
        console.log('Autor creado:', response.data);
        
        this.newAuthorName = '';
        await this.loadAuthors(); // Recargar la lista
        this.$emit('authors-updated'); // Notificar al componente padre
        alert(`Autor "${name}" agregado exitosamente`);
      } catch (error) {
        console.error('Error agregando autor:', error);
        if (error.response && error.response.status === 400) {
          alert('Error: No se pudo agregar el autor. Verifique que el nombre sea válido.');
        } else {
          alert('Error al agregar el autor. Intente nuevamente.');
        }
      }
    }
  }
};
</script>

<style scoped>
.authors-manager {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border: 1px solid #e9ecef;
}

.authors-manager h3 {
  margin: 0 0 20px 0;
  color: #495057;
  text-align: center;
  border-bottom: 2px solid #6f42c1;
  padding-bottom: 10px;
}

.add-author-section {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
  margin-bottom: 20px;
}

.form-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.author-input {
  flex: 1;
  padding: 10px 15px;
  border: 2px solid #e9ecef;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.author-input:focus {
  outline: none;
  border-color: #6f42c1;
  box-shadow: 0 0 0 3px rgba(111, 66, 193, 0.1);
}

.add-author-btn {
  background: #6f42c1;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.3s ease;
  white-space: nowrap;
}

.add-author-btn:hover:not(:disabled) {
  background: #5a359a;
}

.add-author-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.authors-list {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.authors-list h4 {
  margin: 0 0 15px 0;
  color: #495057;
  font-size: 16px;
}

.authors-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.author-chip {
  background: #e9ecef;
  color: #495057;
  padding: 6px 12px;
  border-radius: 15px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid #dee2e6;
}

.no-authors {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  padding: 20px;
  text-align: center;
}

.no-authors p {
  margin: 0;
  color: #856404;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .authors-grid {
    justify-content: center;
  }
}
</style>
