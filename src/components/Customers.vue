<template>
  <div class="customers-component">
    <div class="header">
      <h3>👥 Clientes</h3>
      <div class="controls">
        <button 
          @click="loadCustomers" 
          class="refresh-btn"
          :disabled="loading"
        >
          {{ loading ? 'Cargando...' : '🔄 Actualizar' }}
        </button>
        <button 
          @click="showCreateForm = true" 
          class="add-btn"
        >
          ➕ Nuevo Cliente
        </button>
      </div>
    </div>

    <!-- Estadísticas -->
    <div class="stats">
      <div class="stat-card">
        <span class="stat-number">{{ customers.length }}</span>
        <span class="stat-label">Total Clientes</span>
      </div>
      <div class="stat-card">
        <span class="stat-number">{{ uniqueEmails }}</span>
        <span class="stat-label">Emails Únicos</span>
      </div>
    </div>

    <!-- Buscador -->
    <div class="search-section">
      <input 
        v-model="searchTerm" 
        placeholder="Buscar por nombre o email..." 
        class="search-input"
      />
    </div>

    <!-- Lista de clientes -->
    <div v-if="loading" class="loading-message">
      🔄 Cargando clientes...
    </div>

    <div v-else-if="filteredCustomers.length > 0" class="customers-list">
      <div 
        v-for="customer in paginatedCustomers" 
        :key="customer.id" 
        class="customer-item"
      >
        <div class="customer-avatar">
          <span class="avatar-initials">{{ getInitials(customer.name) }}</span>
        </div>
        
        <div class="customer-details">
          <h4 class="customer-name">{{ customer.name }}</h4>
          <p class="customer-email">{{ customer.email }}</p>
          <div class="customer-meta">
            <span class="customer-id">ID: {{ customer.id }}</span>
            <span class="customer-version">v{{ customer.version || 1 }}</span>
          </div>
        </div>

        <div class="customer-actions">
          <button 
            @click="editCustomer(customer)" 
            class="action-btn edit-btn"
            title="Editar cliente"
          >
            ✏️
          </button>
          <button 
            @click="viewCustomerDetails(customer)" 
            class="action-btn view-btn"
            title="Ver detalles"
          >
            👁️
          </button>
          <button 
            @click="deleteCustomer(customer.id)" 
            class="action-btn delete-btn"
            title="Eliminar cliente"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>{{ searchTerm ? 'No se encontraron clientes que coincidan con la búsqueda' : 'No hay clientes registrados' }}</p>
    </div>

    <!-- Paginación -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        @click="currentPage = Math.max(1, currentPage - 1)"
        :disabled="currentPage === 1"
        class="page-btn"
      >
        ← Anterior
      </button>
      
      <span class="page-info">
        Página {{ currentPage }} de {{ totalPages }}
      </span>
      
      <button 
        @click="currentPage = Math.min(totalPages, currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="page-btn"
      >
        Siguiente →
      </button>
    </div>

    <!-- Modal para crear/editar cliente -->
    <div v-if="showCreateForm || editingCustomer" class="modal-overlay" @click="closeForm">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ editingCustomer ? 'Editar Cliente' : 'Nuevo Cliente' }}</h3>
          <button @click="closeForm" class="close-btn">✖️</button>
        </div>
        
        <form @submit.prevent="saveCustomer" class="customer-form">
          <div class="form-group">
            <label>Nombre *</label>
            <input 
              v-model="form.name" 
              type="text" 
              required
              placeholder="Nombre completo del cliente"
            />
          </div>
          
          <div class="form-group">
            <label>Email *</label>
            <input 
              v-model="form.email" 
              type="email" 
              required
              placeholder="email@ejemplo.com"
            />
          </div>
          
          <div class="form-group">
            <label>Versión</label>
            <input 
              v-model.number="form.version" 
              type="number" 
              min="1"
              placeholder="1"
            />
          </div>
          
          <div class="form-actions">
            <button type="button" @click="closeForm" class="cancel-btn">
              Cancelar
            </button>
            <button 
              type="submit" 
              class="save-btn"
              :disabled="!isFormValid || saving"
            >
              {{ saving ? 'Guardando...' : (editingCustomer ? 'Actualizar' : 'Crear') }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal de detalles del cliente -->
    <div v-if="selectedCustomer" class="modal-overlay" @click="selectedCustomer = null">
      <div class="modal-content details-modal" @click.stop>
        <div class="modal-header">
          <h3>Detalles del Cliente</h3>
          <button @click="selectedCustomer = null" class="close-btn">✖️</button>
        </div>
        
        <div class="customer-details-content">
          <div class="detail-group">
            <strong>ID:</strong> {{ selectedCustomer.id }}
          </div>
          <div class="detail-group">
            <strong>Nombre:</strong> {{ selectedCustomer.name }}
          </div>
          <div class="detail-group">
            <strong>Email:</strong> {{ selectedCustomer.email }}
          </div>
          <div class="detail-group">
            <strong>Versión:</strong> {{ selectedCustomer.version || 1 }}
          </div>
          
          <div class="detail-actions">
            <button @click="editCustomer(selectedCustomer)" class="edit-detail-btn">
              ✏️ Editar Cliente
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CustomersClient from '@/clients/CustomersClients.js'

export default {
  name: 'Customers',
  data() {
    return {
      customers: [],
      loading: false,
      saving: false,
      searchTerm: '',
      currentPage: 1,
      itemsPerPage: 10,
      showCreateForm: false,
      editingCustomer: null,
      selectedCustomer: null,
      form: {
        name: '',
        email: '',
        version: 1
      }
    }
  },
  computed: {
    filteredCustomers() {
      if (!this.searchTerm) return this.customers
      
      const term = this.searchTerm.toLowerCase()
      return this.customers.filter(customer => 
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term)
      )
    },
    
    paginatedCustomers() {
      const start = (this.currentPage - 1) * this.itemsPerPage
      const end = start + this.itemsPerPage
      return this.filteredCustomers.slice(start, end)
    },
    
    totalPages() {
      return Math.ceil(this.filteredCustomers.length / this.itemsPerPage)
    },
    
    uniqueEmails() {
      const emails = new Set(this.customers.map(c => c.email))
      return emails.size
    },
    
    isFormValid() {
      return this.form.name.trim() && this.form.email.trim()
    }
  },
  watch: {
    searchTerm() {
      this.currentPage = 1
    }
  },
  async mounted() {
    await this.loadCustomers()
  },
  methods: {
    async loadCustomers() {
      try {
        this.loading = true
        this.customers = await CustomersClient.getAll()
      } catch (error) {
        console.error('Error cargando clientes:', error)
        this.$emit('error', 'Error al cargar los clientes')
      } finally {
        this.loading = false
      }
    },

    getInitials(name) {
      return name.split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)
    },

    editCustomer(customer) {
      this.editingCustomer = { ...customer }
      this.form.name = customer.name
      this.form.email = customer.email
      this.form.version = customer.version || 1
      this.selectedCustomer = null
    },

    viewCustomerDetails(customer) {
      this.selectedCustomer = customer
    },

    async deleteCustomer(id) {
      if (!confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
        return
      }

      try {
        await CustomersClient.delete(id)
        await this.loadCustomers()
        this.$emit('success', 'Cliente eliminado exitosamente')
      } catch (error) {
        console.error('Error eliminando cliente:', error)
        this.$emit('error', 'Error al eliminar el cliente')
      }
    },

    async saveCustomer() {
      if (!this.isFormValid) return

      try {
        this.saving = true
        
        const customerData = {
          name: this.form.name.trim(),
          email: this.form.email.trim(),
          version: this.form.version || 1
        }

        if (this.editingCustomer) {
          await CustomersClient.update(this.editingCustomer.id, customerData)
          this.$emit('success', 'Cliente actualizado exitosamente')
        } else {
          await CustomersClient.create(customerData)
          this.$emit('success', 'Cliente creado exitosamente')
        }
        
        await this.loadCustomers()
        this.closeForm()
      } catch (error) {
        console.error('Error guardando cliente:', error)
        this.$emit('error', 'Error al guardar el cliente')
      } finally {
        this.saving = false
      }
    },

    closeForm() {
      this.showCreateForm = false
      this.editingCustomer = null
      this.form.name = ''
      this.form.email = ''
      this.form.version = 1
    }
  }
}
</script>

<style scoped>
.customers-component {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header h3 {
  margin: 0;
  color: #2c3e50;
}

.controls {
  display: flex;
  gap: 0.5rem;
}

.refresh-btn, .add-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.refresh-btn {
  background: #6c757d;
  color: white;
}

.refresh-btn:hover:not(:disabled) {
  background: #545b62;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.add-btn {
  background: #28a745;
  color: white;
}

.add-btn:hover {
  background: #218838;
}

.stats {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 6px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  flex: 1;
}

.stat-number {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
  color: #667eea;
}

.stat-label {
  font-size: 0.875rem;
  color: #6c757d;
}

.search-section {
  margin-bottom: 1rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.loading-message {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
}

.customers-list {
  background: white;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.customer-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.2s;
}

.customer-item:last-child {
  border-bottom: none;
}

.customer-item:hover {
  background: #f8f9fa;
}

.customer-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
}

.avatar-initials {
  color: white;
  font-weight: bold;
  font-size: 0.875rem;
}

.customer-details {
  flex: 1;
}

.customer-name {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1rem;
}

.customer-email {
  margin: 0 0 0.5rem 0;
  color: #6c757d;
  font-size: 0.875rem;
}

.customer-meta {
  display: flex;
  gap: 1rem;
  font-size: 0.75rem;
  color: #6c757d;
}

.customer-version {
  background: #e9ecef;
  padding: 0.125rem 0.375rem;
  border-radius: 10px;
  font-weight: 500;
}

.customer-actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  padding: 0.375rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.edit-btn {
  background: #ffc107;
  color: #212529;
}

.edit-btn:hover {
  background: #e0a800;
}

.view-btn {
  background: #17a2b8;
  color: white;
}

.view-btn:hover {
  background: #138496;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #6c757d;
  background: white;
  border-radius: 6px;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.page-btn:hover:not(:disabled) {
  background: #e9ecef;
}

.page-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-info {
  color: #6c757d;
  font-size: 0.875rem;
}

/* Estilos del modal */
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
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.25rem;
}

.customer-form {
  padding: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.25rem;
  font-weight: 500;
  color: #495057;
}

.form-group input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.2);
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.cancel-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ced4da;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn {
  padding: 0.5rem 1rem;
  border: none;
  background: #28a745;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.details-modal .customer-details-content {
  padding: 1rem;
}

.detail-group {
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #f1f3f4;
}

.detail-actions {
  margin-top: 1rem;
  text-align: center;
}

.edit-detail-btn {
  padding: 0.5rem 1rem;
  background: #ffc107;
  color: #212529;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .controls {
    justify-content: center;
  }
  
  .stats {
    flex-direction: column;
  }
  
  .customer-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .customer-actions {
    align-self: stretch;
    justify-content: center;
  }
}
</style>