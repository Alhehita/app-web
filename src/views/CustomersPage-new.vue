<template>
  <div class="customers-page">
    <div class="page-header">
      <h1 class="page-title">Gestión de Clientes</h1>
      <p class="page-subtitle">Administra la base de datos de clientes</p>
    </div>
    
    <div class="content-container">
      <div class="actions-bar">
        <button class="btn btn-primary" @click="showCreateForm = true">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Nuevo Cliente
        </button>
      </div>
      
      <div class="customers-grid" v-if="customers.length > 0">
        <div class="customer-card" v-for="customer in customers" :key="customer.id">
          <div class="customer-avatar">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div class="customer-info">
            <h3 class="customer-name">{{ customer.name }}</h3>
            <p class="customer-email">{{ customer.email }}</p>
            <div class="customer-meta">
              <span class="customer-id">ID: {{ customer.id }}</span>
              <span class="customer-version">v{{ customer.version }}</span>
            </div>
          </div>
          <div class="customer-actions">
            <button class="btn btn-secondary" @click="editCustomer(customer)">Editar</button>
            <button class="btn btn-danger" @click="deleteCustomer(customer.id)">Eliminar</button>
          </div>
        </div>
      </div>
      
      <!-- Formulario de Crear/Editar Cliente -->
      <div v-if="showCreateForm || editingCustomer" class="modal-overlay" @click="closeForm">
        <div class="modal-content" @click.stop>
          <div class="modal-header">
            <h2>{{ editingCustomer ? 'Editar Cliente' : 'Crear Nuevo Cliente' }}</h2>
            <button class="close-btn" @click="closeForm">×</button>
          </div>
          <form @submit.prevent="submitForm" class="customer-form">
            <div class="form-group">
              <label for="name">Nombre del Cliente *</label>
              <input 
                type="text" 
                id="name" 
                v-model="formData.name" 
                required 
                placeholder="Ingresa el nombre completo del cliente"
                :disabled="loading"
              />
            </div>
            <div class="form-group">
              <label for="email">Email *</label>
              <input 
                type="email" 
                id="email" 
                v-model="formData.email" 
                required 
                placeholder="cliente@ejemplo.com"
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
                placeholder="Versión del cliente (ej: 1)"
                :disabled="loading"
              />
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" @click="closeForm" :disabled="loading">
                Cancelar
              </button>
              <button type="submit" class="btn btn-primary" :disabled="loading || !isFormValid">
                <span v-if="loading">Guardando...</span>
                <span v-else>{{ editingCustomer ? 'Actualizar' : 'Crear' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div class="empty-state" v-else>
        <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <h3>No hay clientes registrados</h3>
        <p>Comienza agregando el primer cliente</p>
      </div>
    </div>
  </div>
</template>

<script>
import CustomersClient from '@/clients/CustomersClients.js'

export default {
  name: 'CustomersPage',
  data() {
    return {
      customers: [],
      showCreateForm: false,
      editingCustomer: null,
      loading: false,
      formData: {
        name: '',
        email: '',
        version: 1
      }
    }
  },
  computed: {
    isFormValid() {
      return this.formData.name.trim() && 
             this.formData.email.trim() && 
             this.formData.version >= 1
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
        console.error('Error loading customers:', error)
        alert('Error al cargar los clientes')
      } finally {
        this.loading = false
      }
    },

    editCustomer(customer) {
      this.editingCustomer = { ...customer }
      this.formData.name = customer.name
      this.formData.email = customer.email
      this.formData.version = customer.version || 1
      this.showCreateForm = false
    },

    async deleteCustomer(id) {
      if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
        try {
          this.loading = true
          await CustomersClient.delete(id)
          await this.loadCustomers()
        } catch (error) {
          console.error('Error deleting customer:', error)
          alert('Error al eliminar el cliente')
        } finally {
          this.loading = false
        }
      }
    },

    async submitForm() {
      if (!this.isFormValid) return

      try {
        this.loading = true
        
        if (this.editingCustomer) {
          // Actualizar cliente existente
          await CustomersClient.update(this.editingCustomer.id, {
            name: this.formData.name.trim(),
            email: this.formData.email.trim(),
            version: this.formData.version
          })
        } else {
          // Crear nuevo cliente
          await CustomersClient.create({
            name: this.formData.name.trim(),
            email: this.formData.email.trim(),
            version: this.formData.version
          })
        }
        
        await this.loadCustomers()
        this.closeForm()
      } catch (error) {
        console.error('Error saving customer:', error)
        alert('Error al guardar el cliente. Por favor intenta de nuevo.')
      } finally {
        this.loading = false
      }
    },

    closeForm() {
      this.showCreateForm = false
      this.editingCustomer = null
      this.formData.name = ''
      this.formData.email = ''
      this.formData.version = 1
      this.loading = false
    }
  }
}
</script>

<style scoped>
.customers-page {
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
  margin-bottom: 2rem;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.customers-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.customer-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid #e9ecef;
}

.customer-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
}

.customer-avatar {
  text-align: center;
  margin-bottom: 1rem;
  color: #667eea;
}

.customer-info {
  text-align: center;
  margin-bottom: 1.5rem;
}

.customer-name {
  font-size: 1.25rem;
  font-weight: bold;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.customer-email {
  color: #6c757d;
  margin: 0 0 1rem 0;
}

.customer-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #6c757d;
}

.customer-version {
  background: #e9ecef;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 500;
}

.customer-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

.customer-actions .btn {
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  margin-bottom: 0.5rem;
  color: #495057;
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

.customer-form {
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
  .customers-grid {
    grid-template-columns: 1fr;
  }
  
  .customer-actions {
    flex-direction: column;
  }
  
  .actions-bar {
    justify-content: center;
  }
}
</style>
