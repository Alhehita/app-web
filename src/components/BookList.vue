<template>
  <div class="book-list">
    <h2>📖 Lista de Libros</h2>
    
    <!-- Filtros y controles -->
    <div class="controls">
      <button 
        @click="loadBooks" 
        class="refresh-btn"
        :disabled="loading"
      >
        {{ loading ? 'Cargando...' : ' Actualizar' }}
      </button>
      
      <div class="stats">
        <span class="stat-item">
          Total: <strong>{{ books.length }}</strong>
        </span>
        <span class="stat-item">
          En Stock: <strong>{{ booksInStock }}</strong>
        </span>
      </div>
    </div>

    <!-- Mensaje de carga -->
    <div v-if="loading" class="loading-message">
      Cargando libros...
    </div>

    <!-- Lista de libros -->
    <div v-else-if="books.length > 0" class="books-grid">
      <div 
        v-for="book in books" 
        :key="book.id" 
        class="book-card"
        :class="{ 'out-of-stock': !isInStock(book) }"
      >
        <!-- Header del libro -->
        <div class="book-header">
          <h3 class="book-title">{{ book.title }}</h3>
          <div class="book-actions">
            <button 
              @click="editBook(book)" 
              class="edit-btn"
              title="Editar libro"
            >
              ✏️
            </button>
          </div>
        </div>

        <!-- Información del libro -->
        <div class="book-info">
          <div class="info-row">
            <span class="label">ISBN:</span>
            <span class="value">{{ book.isbn }}</span>
          </div>
          
          <div class="info-row">
            <span class="label">Autor(es):</span>
            <span class="value">
              <span 
                v-for="(author, index) in book.authors" 
                :key="author.id"
                class="author-tag"
              >
                {{ author.name }}{{ index < book.authors.length - 1 ? ', ' : '' }}
              </span>
            </span>
          </div>
        </div>

        <!-- Información de inventario -->
        <div class="inventory-info">
          <div class="stock-section">
            <div class="stock-item">
              <span class="stock-label">Stock:</span>
              <span class="stock-value" :class="getStockClass(book)">
                {{ getStockQuantity(book) }}
              </span>
            </div>
            
            <div class="stock-item">
              <span class="stock-label">Precio:</span>
              <span class="stock-value price">
                ${{ formatPrice(getBookPrice(book)) }}
              </span>
            </div>
          </div>
          
          <div class="stock-status">
            <span 
              class="status-badge" 
              :class="getStockStatusClass(book)"
            >
              {{ getStockStatus(book) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay libros -->
    <div v-else class="empty-state">
      <div class="empty-content">
        <h3> No hay libros disponibles</h3>
        <p>Agregue algunos libros para comenzar a verlos aquí.</p>
      </div>
    </div>
  </div>
</template>

<script>
import BooksClient from '@/clients/BooksClients.js';

export default {
  name: 'BookList',
  data() {
    return {
      books: [],
      loading: false
    };
  },
  computed: {
    booksInStock() {
      return this.books.filter(book => this.isInStock(book)).length;
    }
  },
  async mounted() {
    await this.loadBooks();
  },
  methods: {
    async loadBooks() {
      this.loading = true;
      try {
        const books = await BooksClient.getAll();
        this.books = books || [];
        console.log('Libros cargados:', this.books.length);
      } catch (error) {
        console.error('Error cargando libros:', error);
        this.books = [];
        alert('Error al cargar los libros. Intente nuevamente.');
      } finally {
        this.loading = false;
      }
    },

    editBook(book) {
      console.log('Editando libro:', book);
      this.$emit('edit-book', book);
    },

    isInStock(book) {
      return this.getStockQuantity(book) > 0;
    },

    getStockQuantity(book) {
      return book.inventory && book.inventory.length > 0 
        ? book.inventory[0].quantity 
        : 0;
    },

    getBookPrice(book) {
      return book.inventory && book.inventory.length > 0 
        ? book.inventory[0].price 
        : 0;
    },

    getStockStatus(book) {
      const quantity = this.getStockQuantity(book);
      if (quantity === 0) return 'Sin Stock';
      if (quantity <= 5) return 'Stock Bajo';
      return 'Disponible';
    },

    getStockStatusClass(book) {
      const quantity = this.getStockQuantity(book);
      if (quantity === 0) return 'status-out';
      if (quantity <= 5) return 'status-low';
      return 'status-available';
    },

    getStockClass(book) {
      const quantity = this.getStockQuantity(book);
      if (quantity === 0) return 'stock-zero';
      if (quantity <= 5) return 'stock-low';
      return 'stock-good';
    },

    formatPrice(price) {
      return Number(price).toLocaleString('es-CO', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    }
  }
};
</script>

<style scoped>
.book-list {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.book-list h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
  border-bottom: 3px solid #6f42c1;
  padding-bottom: 10px;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.refresh-btn {
  background: #6f42c1;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  background: #5a359a;
}

.refresh-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  font-size: 14px;
  color: #495057;
}

.loading-message {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-size: 18px;
}

.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.book-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.book-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.book-card.out-of-stock {
  opacity: 0.7;
  border-color: #dc3545;
}

.book-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  background: #6f42c1;
  color: white;
}

.book-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  flex: 1;
  margin-right: 10px;
}

.book-actions {
  display: flex;
  gap: 5px;
}

.edit-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 4px;
  padding: 5px 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.edit-btn:hover {
  background: rgba(255,255,255,0.3);
}

.book-info {
  padding: 15px;
}

.info-row {
  display: flex;
  margin-bottom: 8px;
  align-items: flex-start;
}

.label {
  font-weight: 600;
  color: #495057;
  width: 80px;
  flex-shrink: 0;
}

.value {
  color: #6c757d;
  flex: 1;
}

.author-tag {
  color: #6f42c1;
  font-weight: 500;
}

.inventory-info {
  padding: 15px;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
}

.stock-section {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.stock-item {
  display: flex;
  align-items: center;
  gap: 5px;
}

.stock-label {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.stock-value {
  font-weight: 600;
  font-size: 14px;
}

.stock-value.price {
  color: #28a745;
}

.stock-zero {
  color: #dc3545;
}

.stock-low {
  color: #ffc107;
}

.stock-good {
  color: #28a745;
}

.stock-status {
  display: flex;
  justify-content: center;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-out {
  background: #f8d7da;
  color: #721c24;
}

.status-low {
  background: #fff3cd;
  color: #856404;
}

.status-available {
  background: #d1ecf1;
  color: #0c5460;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
}

.empty-content h3 {
  color: #6c757d;
  margin-bottom: 10px;
}

.empty-content p {
  color: #adb5bd;
  font-size: 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: 1fr;
  }
  
  .controls {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .stats {
    justify-content: center;
  }
  
  .stock-section {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
