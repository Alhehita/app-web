<template>
  <div class="book-search">
    <h2>🔍 Búsqueda de Libros</h2>
    
    <!-- Barra de búsqueda -->
    <div class="search-bar">
      <div class="search-input-group">
        <input 
          v-model="searchQuery" 
          @input="performSearch"
          @keyup.enter="performSearch"
          placeholder="Buscar por título, autor o ISBN..."
          class="search-input"
        />
        <button 
          @click="performSearch" 
          class="search-btn"
          :disabled="loading"
        >
          {{ loading ? '' : '🔍' }}
        </button>
        <button 
          @click="clearSearch" 
          class="clear-btn"
          v-if="searchQuery"
        >
          ✖️
        </button>
      </div>
    </div>

    <!-- Filtros adicionales -->
    <div class="filters" v-if="searchQuery">
      <div class="filter-group">
        <label>Filtrar por:</label>
        <select v-model="filterType" @change="performSearch" class="filter-select">
          <option value="title">Solo título</option>
          <option value="author">Solo autor</option>
          <option value="isbn">Solo ISBN</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Stock:</label>
        <select v-model="stockFilter" @change="performSearch" class="filter-select">
          <option value="all">Todos</option>
          <option value="available">Solo disponibles</option>
          <option value="out-of-stock">Sin stock</option>
        </select>
      </div>
    </div>

    <!-- Mensaje de búsqueda -->
    <div v-if="searchQuery && !loading" class="search-info">
      <p v-if="searchResults.length > 0">
        Se encontraron <strong>{{ searchResults.length }}</strong> resultados para "{{ searchQuery }}"
      </p>
      <p v-else class="no-results">
        No se encontraron resultados para "{{ searchQuery }}"
      </p>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="loading">
      Buscando libros...
    </div>

    <!-- Resultados de búsqueda -->
    <div v-else-if="searchResults.length > 0" class="search-results">
      <div 
        v-for="book in filteredResults" 
        :key="book.id" 
        class="result-card"
        :class="{ 'out-of-stock': !isInStock(book) }"
      >
        <!-- Header del resultado -->
        <div class="result-header">
          <h3 class="result-title" v-html="highlightText(book.title)"></h3>
          <div class="result-actions">
            <button 
              @click="editBook(book)" 
              class="edit-btn"
              title="Editar libro"
            >
              ✏️ Editar
            </button>
          </div>
        </div>

        <!-- Contenido del resultado -->
        <div class="result-content">
          <div class="result-info">
            <div class="info-item">
              <span class="info-label">ISBN:</span>
              <span class="info-value" v-html="highlightText(book.isbn)"></span>
            </div>
            
            <div class="info-item">
              <span class="info-label">Autor(es):</span>
              <span class="info-value">
                <span 
                  v-for="(author, index) in book.authors" 
                  :key="author.id"
                  v-html="highlightText(author.name) + (index < book.authors.length - 1 ? ', ' : '')"
                ></span>
              </span>
            </div>
          </div>

          <!-- Información de stock -->
          <div class="stock-info">
            <div class="stock-details">
              <span class="stock-quantity" :class="getStockClass(book)">
                Stock: {{ getStockQuantity(book) }}
              </span>
              <span class="stock-price">
                Precio: ${{ formatPrice(getBookPrice(book)) }}
              </span>
            </div>
            <span 
              class="stock-status" 
              :class="getStockStatusClass(book)"
            >
              {{ getStockStatus(book) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Estado inicial o sin resultados -->
    <div v-else-if="!searchQuery" class="search-placeholder">
      <div class="placeholder-content">
        <h3>🔍 Búsqueda de Libros</h3>
        <p>Ingrese un término de búsqueda para encontrar libros en la base de datos.</p>
        <div class="search-tips">
          <h4>Consejos de búsqueda:</h4>
          <ul>
            <li>Busque por título, autor o ISBN</li>
            <li>Use filtros para refinar sus resultados</li>
            <li>Los resultados se actualizan mientras escribe</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BooksClient from '@/clients/BooksClients.js';

export default {
  name: 'BookSearch',
  data() {
    return {
      searchQuery: '',
      searchResults: [],
      filterType: 'title',
      stockFilter: 'all',
      loading: false,
      debounceTimer: null
    };
  },
  computed: {
    filteredResults() {
      if (this.stockFilter === 'all') {
        return this.searchResults;
      }
      
      return this.searchResults.filter(book => {
        const inStock = this.isInStock(book);
        return this.stockFilter === 'available' ? inStock : !inStock;
      });
    }
  },
  methods: {
    async performSearch() {
      // Debounce para evitar demasiadas peticiones
      clearTimeout(this.debounceTimer);
      
      if (!this.searchQuery.trim()) {
        this.searchResults = [];
        return;
      }

      this.debounceTimer = setTimeout(async () => {
        this.loading = true;
        
        try {
          // Buscar en todos los libros ya que no tenemos endpoint de búsqueda
          await this.searchInAllBooks();
          console.log(`Búsqueda completada: ${this.searchResults.length} resultados`);
        } catch (error) {
          console.error('Error en búsqueda:', error);
          this.searchResults = [];
        } finally {
          this.loading = false;
        }
      }, 300);
    },

    async searchInAllBooks() {
      try {
        const allBooks = await BooksClient.getAll();
        
        this.searchResults = allBooks.filter(book => {
          const query = this.searchQuery.toLowerCase();
          
          switch (this.filterType) {
            case 'title':
              return book.title.toLowerCase().includes(query);
            case 'author':
              return book.authors.some(author => 
                author.name.toLowerCase().includes(query)
              );
            case 'isbn':
              return book.isbn.toLowerCase().includes(query);
            default: // 'all'
              return (
                book.title.toLowerCase().includes(query) ||
                book.authors.some(author => 
                  author.name.toLowerCase().includes(query)
                ) ||
                book.isbn.toLowerCase().includes(query)
              );
          }
        });
      } catch (error) {
        console.error('Error buscando en todos los libros:', error);
        this.searchResults = [];
      }
    },

    clearSearch() {
      this.searchQuery = '';
      this.searchResults = [];
      this.filterType = 'title';
      this.stockFilter = 'all';
    },

    highlightText(text) {
      if (!this.searchQuery || !text) return text;
      
      const query = this.searchQuery.trim();
      const regex = new RegExp(`(${query})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    },

    editBook(book) {
      console.log('Editando libro desde búsqueda:', book);
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
.book-search {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.book-search h2 {
  text-align: center;
  color: #333;
  margin-bottom: 30px;
  font-size: 28px;
  border-bottom: 3px solid #17a2b8;
  padding-bottom: 10px;
}

.search-bar {
  margin-bottom: 20px;
}

.search-input-group {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
  border: 2px solid #e9ecef;
  border-radius: 25px;
  overflow: hidden;
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.search-input {
  flex: 1;
  padding: 12px 20px;
  border: none;
  outline: none;
  font-size: 16px;
}

.search-btn, .clear-btn {
  background: #17a2b8;
  color: white;
  border: none;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.search-btn:hover {
  background: #138496;
}

.clear-btn {
  background: #6c757d;
  border-left: 1px solid #dee2e6;
}

.clear-btn:hover {
  background: #5a6268;
}

.filters {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
  background: white;
}

.search-info {
  text-align: center;
  margin-bottom: 20px;
  padding: 10px;
  background: #e3f2fd;
  border-radius: 6px;
  border: 1px solid #bbdefb;
}

.search-info p {
  margin: 0;
  color: #1565c0;
}

.no-results {
  color: #d32f2f !important;
  background: #ffebee !important;
  border-color: #ffcdd2 !important;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #6c757d;
  font-size: 18px;
}

.search-results {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.result-card {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.result-card:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.result-card.out-of-stock {
  opacity: 0.7;
  border-color: #dc3545;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: #17a2b8;
  color: white;
}

.result-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  flex: 1;
}

.edit-btn {
  background: rgba(255,255,255,0.2);
  border: none;
  border-radius: 4px;
  padding: 8px 12px;
  color: white;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.edit-btn:hover {
  background: rgba(255,255,255,0.3);
}

.result-content {
  display: flex;
  padding: 15px;
  gap: 20px;
}

.result-info {
  flex: 1;
}

.info-item {
  display: flex;
  margin-bottom: 8px;
  align-items: flex-start;
}

.info-label {
  font-weight: 600;
  color: #495057;
  width: 80px;
  flex-shrink: 0;
}

.info-value {
  color: #6c757d;
  flex: 1;
}

.stock-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  min-width: 150px;
}

.stock-details {
  display: flex;
  flex-direction: column;
  gap: 5px;
  text-align: right;
}

.stock-quantity, .stock-price {
  font-size: 14px;
  font-weight: 600;
}

.stock-price {
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

.search-placeholder {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.placeholder-content h3 {
  margin-bottom: 15px;
  font-size: 24px;
}

.placeholder-content p {
  font-size: 16px;
  margin-bottom: 30px;
}

.search-tips {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e9ecef;
  max-width: 400px;
  margin: 0 auto;
  text-align: left;
}

.search-tips h4 {
  margin: 0 0 15px 0;
  color: #495057;
}

.search-tips ul {
  margin: 0;
  padding-left: 20px;
}

.search-tips li {
  margin-bottom: 8px;
  color: #6c757d;
}

/* Highlight styles */
:deep(mark) {
  background: #fff3cd;
  color: #856404;
  padding: 1px 3px;
  border-radius: 2px;
  font-weight: 600;
}

/* Responsive */
@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    gap: 15px;
  }
  
  .result-content {
    flex-direction: column;
    gap: 15px;
  }
  
  .stock-info {
    align-items: flex-start;
    flex-direction: row;
    justify-content: space-between;
  }
  
  .search-input-group {
    border-radius: 8px;
  }
}
</style>
