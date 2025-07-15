# Sistema de Gestión Web

Una aplicación web Vue.js para la gestión de autores, libros y clientes con conexión a microservicios backend a través de Traefik como balanceador de carga.

## 🏗️ Arquitectura de la Aplicación

### Componentes Principales

#### 📄 **Views (Páginas)**
- **`HomeView.vue`**: Página principal con tarjetas de navegación hacia autores, libros y clientes
- **`AuthorsPage.vue`**: Gestión completa de autores (CRUD) con tabla y formularios modales
- **`BooksPage.vue`**: Administración de libros con campos específicos como ISBN y precio
- **`CustomersPage.vue`**: Manejo de clientes con validación de email

#### 🧩 **Components (Componentes Reutilizables)**
- **`NavBar.vue`**: Barra de navegación principal con enlaces a todas las secciones
- **`Authors.vue`**: Componente específico para mostrar información de autores
- **`Books.vue`**: Componente para visualización de libros
- **`Customers.vue`**: Componente para datos de clientes

#### 🔌 **API Clients (Clientes de API)**
- **`AuthorsClients.js`**: Cliente para comunicación con el microservicio de autores
- **`BooksClients.js`**: Cliente para el microservicio de libros
- **`CustomersClients.js`**: Cliente para el microservicio de clientes

#### 🛣️ **Router**
- **`router/index.js`**: Configuración de rutas de la aplicación

## 🔗 Conexión del Cliente de Autores

### Estrategia de Conectividad
El cliente de autores implementa una estrategia de **alta disponibilidad** con dos niveles:

```javascript
// 1. Traefik como balanceador principal (puerto 80)
const TRAEFIK_BASE_URL = 'http://localhost:80'

// 2. Fallback directo a instancia de autores (puerto 8081)
const FALLBACK_URLS = ['http://localhost:8081/API/v1.0']
```

### Flujo de Conexión

1. **Intento Principal - Traefik**
   ```
   URL: http://localhost:80/api/authors/{endpoint}
   ```
   - El cliente intenta conectarse a través de Traefik
   - Traefik distribuye la carga entre las instancias disponibles
   - Tiempo de espera: 5 segundos

2. **Fallback Automático**
   ```
   URL: http://localhost:8081/API/v1.0/authors/{endpoint}
   ```
   - Si Traefik no responde, se conecta directamente a la instancia
   - Permite funcionamiento incluso si el balanceador falla

### Métodos Disponibles

#### Operaciones CRUD
- **`getAll()`**: Obtiene todos los autores con sus libros
- **`getById(id)`**: Obtiene un autor específico por ID
- **`create(author)`**: Crea un nuevo autor
- **`update(id, author)`**: Actualiza un autor existente
- **`delete(id)`**: Elimina un autor

#### Métodos Especiales
- **`getByBookIsbn(isbn)`**: Busca autores por ISBN de libro

### Estructura de Datos
Cada entidad maneja un campo `version` para control de concurrencia optimista:

```javascript
// Ejemplo de autor
{
  id: 1,
  name: "Gabriel García Márquez",
  version: 1
}
```

## 🚀 Configuración del Proyecto

### Instalación
```bash
npm install
```

### Desarrollo (hot-reload)
```bash
npm run serve
```
La aplicación estará disponible en `http://localhost:8080`

### Producción
```bash
npm run build
```

### Pruebas Unitarias
```bash
npm run test:unit
```

## 🌐 Configuración del Backend

### Servicios Requeridos
1. **Traefik** (puerto 80) - Balanceador de carga
2. **Authors Service** (puerto 8081) - Microservicio de autores
3. **Books Service** (puerto 8082) - Microservicio de libros
4. **Customers Service** (puerto 8083) - Microservicio de clientes

### Endpoints Esperados

#### Authors Service
- `GET /authors` - Lista todos los autores
- `GET /authors/{id}` - Obtiene autor por ID
- `POST /authors` - Crea nuevo autor
- `PUT /authors/{id}` - Actualiza autor
- `DELETE /authors/{id}` - Elimina autor
- `GET /authors/by-book/{isbn}` - Autores por ISBN

#### Books Service
- Endpoints similares para libros con campo `isbn` y `price`

#### Customers Service
- Endpoints similares para clientes con campo `email`

## 📱 Funcionalidades

### Gestión de Autores
- ✅ Lista completa con tabla responsive
- ✅ Formulario modal para crear/editar
- ✅ Validación de campos obligatorios
- ✅ Eliminación con confirmación
- ✅ Búsqueda por ISBN de libro

### Gestión de Libros
- ✅ CRUD completo con ISBN y precio
- ✅ Validación de formato de datos
- ✅ Interfaz moderna con modales

### Gestión de Clientes
- ✅ Administración con validación de email
- ✅ Campos de nombre y correo electrónico
- ✅ Control de versiones para concurrencia

## 🎨 Tecnologías Utilizadas

- **Vue.js 3** - Framework principal
- **Vue Router** - Navegación entre páginas
- **Axios** - Cliente HTTP para APIs
- **CSS3** - Estilos modernos y responsive
- **JavaScript ES6+** - Lógica de aplicación

## 📞 Soporte

Para cualquier configuración adicional, consulta la [documentación oficial de Vue CLI](https://cli.vuejs.org/config/).
