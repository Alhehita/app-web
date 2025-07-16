<template>
  <div class="home">
    <!-- Header de la aplicación -->
    <header class="app-header">
      <div class="header-content">
        <h1 class="app-title"> Sistema de Gestión de Libros</h1>
        <p class="app-subtitle">Administra tu biblioteca de manera eficiente</p>
      </div>
    </header>

    <!-- Navegación por pestañas -->
    <nav class="tab-navigation">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        class="tab-button"
        :class="{ 'active': activeTab === tab.id }"
      >
        {{ tab.icon }} {{ tab.label }}
      </button>
    </nav>

    <!-- Contenido principal -->
    <main class="main-content">
      <!-- Pestaña: Lista de Libros -->
      <div v-if="activeTab === 'list'" class="tab-content">
        <BookList 
          @edit-book="handleEditBook"
          ref="bookList"
        />
      </div>

      <!-- Pestaña: Agregar/Editar Libro -->
      <div v-if="activeTab === 'add'" class="tab-content">
        <div class="form-header">
          <h2>{{ editingBook ? '✏️ Editar Libro' : '➕ Agregar Nuevo Libro' }}</h2>
          <button 
            v-if="editingBook" 
            @click="cancelEdit"
            class="cancel-edit-btn"
          >
            ❌ Cancelar Edición
          </button>
        </div>
        
        <BookForm 
          :book-to-edit="editingBook"
          @book-saved="handleBookSaved"
          @edit-cancelled="handleEditCancelled"
        />
      </div>

      <!-- Pestaña: Búsqueda -->
      <div v-if="activeTab === 'search'" class="tab-content">
        <BookSearch 
          @edit-book="handleEditBook"
        />
      </div>

      <!-- Pestaña: Gestión de Autores -->
      <div v-if="activeTab === 'authors'" class="tab-content">
        <AuthorsManager 
          @authors-updated="handleAuthorsUpdated"
        />
      </div>
    </main>

    <!-- Notificaciones toast -->
    <div v-if="notification" class="notification" :class="notification.type">
      <div class="notification-content">
        <span class="notification-message">{{ notification.message }}</span>
        <button @click="closeNotification" class="notification-close">✖️</button>
      </div>
    </div>
  </div>
</template>

<script>
import BookList from '@/components/BookList.vue';
import BookForm from '@/components/BookForm.vue';
import BookSearch from '@/components/BookSearch.vue';
import AuthorsManager from '@/components/AuthorsManager.vue';

export default {
  name: 'BooksPage',
  components: {
    BookList,
    BookForm,
    BookSearch,
    AuthorsManager
  },
  data() {
    return {
      activeTab: 'list',
      editingBook: null,
      notification: null,
      tabs: [
        {
          id: 'list',
          label: 'Lista de Libros',
          icon: '📖'
        },
        {
          id: 'add',
          label: 'Agregar Libro',
          icon: '➕'
        },
        {
          id: 'search',
          label: 'Buscar Libros',
          icon: '🔍'
        },
        {
          id: 'authors',
          label: 'Gestionar Autores',
          icon: '👥'
        }
      ]
    };
  },
  methods: {
    handleEditBook(book) {
      console.log('Iniciando edición de libro:', book);
      this.editingBook = { ...book }; // Crear una copia del libro
      this.activeTab = 'add'; // Cambiar a la pestaña de formulario
      this.showNotification('Libro cargado para edición', 'info');
    },

    handleBookSaved(savedBook) {
      console.log('Libro guardado:', savedBook);
      this.editingBook = null;
      this.activeTab = 'list'; // Volver a la lista después de guardar
      
      // Refrescar la lista de libros
      if (this.$refs.bookList) {
        this.$refs.bookList.loadBooks();
      }
      
      this.showNotification('Libro guardado exitosamente', 'success');
    },

    handleEditCancelled() {
      console.log('Edición cancelada');
      this.editingBook = null;
      this.showNotification('Edición cancelada', 'info');
    },

    cancelEdit() {
      this.editingBook = null;
      this.activeTab = 'list';
      this.showNotification('Edición cancelada', 'info');
    },

    handleAuthorsUpdated() {
      console.log('Lista de autores actualizada');
      // Si estamos en el formulario, podríamos refrescar la lista de autores disponibles
      this.showNotification('Lista de autores actualizada', 'success');
    },

    showNotification(message, type = 'info') {
      this.notification = { message, type };
      
      // Auto-cerrar la notificación después de 3 segundos
      setTimeout(() => {
        this.closeNotification();
      }, 3000);
    },

    closeNotification() {
      this.notification = null;
    }
  },
  mounted() {
    console.log('BooksPage component montado');
  }
};
</script>

<style scoped>
.home {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.app-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 30px 20px;
  text-align: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.app-title {
  margin: 0 0 10px 0;
  font-size: 36px;
  font-weight: 700;
  color: #333;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.app-subtitle {
  margin: 0;
  font-size: 18px;
  color: #666;
  font-weight: 400;
}

.tab-navigation {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 0 20px;
  display: flex;
  justify-content: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.tab-button {
  background: none;
  border: none;
  padding: 15px 25px;
  font-size: 16px;
  font-weight: 600;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
}

.tab-button:hover {
  color: #333;
  background: rgba(0, 0, 0, 0.05);
}

.tab-button.active {
  color: #6f42c1;
  border-bottom-color: #6f42c1;
  background: rgba(111, 66, 193, 0.05);
}

.main-content {
  padding: 30px 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.tab-content {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 30px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #e9ecef;
}

.form-header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.cancel-edit-btn {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.cancel-edit-btn:hover {
  background: #5a6268;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  max-width: 400px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.notification.info {
  background: #cce7ff;
  border: 1px solid #b3d9ff;
  color: #004085;
}

.notification.warning {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  color: #856404;
}

.notification.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.notification-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
}

.notification-message {
  flex: 1;
  font-weight: 500;
}

.notification-close {
  background: none;
  border: none;
  font-size: 14px;
  cursor: pointer;
  margin-left: 10px;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.notification-close:hover {
  opacity: 1;
}

/* Responsive design */
@media (max-width: 768px) {
  .app-title {
    font-size: 28px;
  }
  
  .app-subtitle {
    font-size: 16px;
  }
  
  .tab-navigation {
    flex-wrap: wrap;
    justify-content: flex-start;
    padding: 0 10px;
  }
  
  .tab-button {
    padding: 12px 15px;
    font-size: 14px;
    flex: 1;
    min-width: auto;
  }
  
  .main-content {
    padding: 20px 10px;
  }
  
  .tab-content {
    padding: 20px;
    border-radius: 10px;
  }
  
  .form-header {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .tab-navigation {
    flex-direction: column;
  }
  
  .tab-button {
    text-align: center;
    border-bottom: 1px solid #e9ecef;
    border-radius: 0;
  }
  
  .tab-button:last-child {
    border-bottom: none;
  }
  
  .tab-button.active {
    border-bottom-color: #e9ecef;
    background: #6f42c1;
    color: white;
  }
}
</style>
