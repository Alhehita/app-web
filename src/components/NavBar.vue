<template>
  <nav class="navbar">
    <div class="nav-container">
      <!-- Logo y título -->
      <div class="nav-brand">
        <router-link to="/" class="brand-link">
          <span class="brand-icon">📚</span>
          <span class="brand-text">BookStore</span>
        </router-link>
      </div>

      <!-- Menú de navegación -->
      <div class="nav-menu" :class="{ active: isMenuOpen }">
        <ul class="nav-links">
          <li class="nav-item">
            <router-link 
              to="/" 
              class="nav-link"
              @click="closeMenu"
            >
              <span class="nav-icon">🏠</span>
              <span class="nav-text">Inicio</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/books" 
              class="nav-link"
              @click="closeMenu"
            >
              <span class="nav-icon">📖</span>
              <span class="nav-text">Libros</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/authors" 
              class="nav-link"
              @click="closeMenu"
            >
              <span class="nav-icon">✍️</span>
              <span class="nav-text">Autores</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link 
              to="/customers" 
              class="nav-link"
              @click="closeMenu"
            >
              <span class="nav-icon">👥</span>
              <span class="nav-text">Clientes</span>
            </router-link>
          </li>
        </ul>
      </div>

      <!-- Botón del menú móvil -->
      <div class="nav-toggle" @click="toggleMenu">
        <span class="bar" :class="{ active: isMenuOpen }"></span>
        <span class="bar" :class="{ active: isMenuOpen }"></span>
        <span class="bar" :class="{ active: isMenuOpen }"></span>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  data() {
    return {
      isMenuOpen: false
    }
  },
  methods: {
    toggleMenu() {
      this.isMenuOpen = !this.isMenuOpen
    },
    closeMenu() {
      this.isMenuOpen = false
    }
  },
  mounted() {
    // Cerrar menú al hacer clic fuera de él
    document.addEventListener('click', (e) => {
      if (!this.$el.contains(e.target)) {
        this.isMenuOpen = false
      }
    })
  }
}
</script>

<style scoped>
.navbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 64px;
}

.nav-brand {
  display: flex;
  align-items: center;
}

.brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
  font-weight: bold;
  font-size: 1.25rem;
  transition: transform 0.2s;
}

.brand-link:hover {
  transform: scale(1.05);
}

.brand-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.brand-text {
  font-family: 'Arial', sans-serif;
  letter-spacing: 0.5px;
}

.nav-menu {
  display: flex;
  align-items: center;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 0.5rem;
}

.nav-item {
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  transition: all 0.3s ease;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.nav-link::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
}

.nav-link:hover::before {
  transform: translateX(0);
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}

.nav-link.router-link-active {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.nav-icon {
  margin-right: 0.5rem;
  font-size: 1.1rem;
}

.nav-text {
  position: relative;
  z-index: 1;
}

.nav-toggle {
  display: none;
  flex-direction: column;
  cursor: pointer;
  padding: 0.5rem;
}

.bar {
  width: 25px;
  height: 3px;
  background: white;
  margin: 3px 0;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.bar.active:nth-child(1) {
  transform: rotate(-45deg) translate(-5px, 6px);
}

.bar.active:nth-child(2) {
  opacity: 0;
}

.bar.active:nth-child(3) {
  transform: rotate(45deg) translate(-5px, -6px);
}

/* Responsive */
@media (max-width: 768px) {
  .nav-toggle {
    display: flex;
  }

  .nav-menu {
    position: fixed;
    left: -100%;
    top: 64px;
    flex-direction: column;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    width: 100%;
    text-align: center;
    transition: 0.3s;
    box-shadow: 0 10px 27px rgba(0, 0, 0, 0.05);
    backdrop-filter: blur(10px);
  }

  .nav-menu.active {
    left: 0;
  }

  .nav-links {
    flex-direction: column;
    width: 100%;
    padding: 1rem 0;
  }

  .nav-item {
    width: 100%;
  }

  .nav-link {
    padding: 1rem 2rem;
    margin: 0.25rem 1rem;
    border-radius: 8px;
    justify-content: flex-start;
  }

  .nav-link:hover {
    transform: translateX(10px);
  }

  .brand-text {
    display: none;
  }
}

@media (max-width: 480px) {
  .nav-container {
    padding: 0 0.5rem;
  }

  .brand-icon {
    font-size: 1.25rem;
  }

  .nav-link {
    padding: 0.875rem 1.5rem;
    margin: 0.125rem 0.5rem;
  }
}

/* Animaciones adicionales */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.nav-item {
  animation: slideIn 0.3s ease-out;
}

.nav-item:nth-child(1) { animation-delay: 0.1s; }
.nav-item:nth-child(2) { animation-delay: 0.2s; }
.nav-item:nth-child(3) { animation-delay: 0.3s; }
.nav-item:nth-child(4) { animation-delay: 0.4s; }

/* Estados especiales */
.nav-link:active {
  transform: scale(0.95);
}

.navbar::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
}
</style>