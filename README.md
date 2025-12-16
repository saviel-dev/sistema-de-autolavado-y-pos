# 🚗 Autolavado Gochi - Sistema Administrativo

Sistema de gestión administrativa completo para el autolavado Gochi, desarrollado con tecnologías modernas y diseñado para optimizar las operaciones diarias del negocio.

---

## 📋 Descripción del Proyecto

**Autolavado Gochi Boss** es una aplicación web integral que permite administrar todos los aspectos operativos de un autolavado, desde la gestión de clientes y vehículos hasta el control de inventario, facturación (POS), reportes y administración de personal.

### 🎯 Características Principales

- 💼 **Gestión de Clientes**: Administración completa de clientes con soporte para múltiples teléfonos y vehículos por cliente
- 🚙 **Gestión de Vehículos**: Registro detallado de vehículos con fotos y asignación a clientes
- 👷 **Administración de Trabajadores**: Control de empleados con permisos diferenciados (admin/trabajador)
- 📦 **Inventario de Productos**: Control de stock de productos con códigos de barras
- 🧴 **Gestión de Insumos**: Administración de consumibles con tracking de movimientos
- 💰 **Punto de Venta (POS)**: Sistema completo para registrar órdenes y generar facturas
- 📊 **Reportes**: Visualización de estadísticas y métricas del negocio
- 📅 **Citas**: Sistema de agendamiento de servicios
- 🔔 **Notificaciones**: Sistema de alertas integrado
- ⚙️ **Configuración**: Personalización de parámetros del negocio
- 🔐 **Autenticación Segura**: Sistema de login con roles diferenciados

---

## 🛠️ Stack Tecnológico

### Frontend

- **React 18** - Biblioteca principal de UI
- **TypeScript** - Tipado estático para mayor seguridad
- **Vite** - Build tool y dev server ultra-rápido
- **React Router DOM** - Navegación entre páginas
- **Tailwind CSS** - Framework de estilos utility-first
- **shadcn/ui** - Componentes UI accesibles y personalizables
- **Radix UI** - Primitivas UI sin estilos

### Backend y Base de Datos

- **Supabase** - Backend as a Service (BaaS)
  - Autenticación
  - Base de datos PostgreSQL
  - Storage para imágenes
  - Real-time subscriptions

### Bibliotecas Destacadas

- **React Hook Form** + **Zod** - Manejo de formularios y validación
- **TanStack Query** - Estado del servidor y cache
- **Recharts** - Gráficos y visualizaciones
- **jsPDF** - Generación de PDFs
- **Framer Motion** - Animaciones fluidas
- **date-fns** - Manipulación de fechas
- **Lucide React** - Íconos modernos
- **Sonner** - Notificaciones toast elegantes

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** >= 18.x (recomendado: usar [nvm](https://github.com/nvm-sh/nvm))
- **npm** o **bun** (el proyecto incluye `bun.lockb`)
- Cuenta de **Supabase** configurada

### Pasos de Instalación

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>

# 2. Navegar al directorio del proyecto
cd "autolavado gochi"

# 3. Instalar dependencias
npm install
# O si prefieres usar bun:
bun install

# 4. Configurar variables de entorno
# Crear archivo .env en la raíz del proyecto con:
# VITE_SUPABASE_URL=tu_url_de_supabase
# VITE_SUPABASE_ANON_KEY=tu_anon_key_de_supabase

# 5. Iniciar el servidor de desarrollo
npm run dev
# O con bun:
bun dev
```

La aplicación estará disponible en `http://localhost:5173`

---

## 📁 Estructura del Proyecto

```
autolavado gochi/
├── src/
│   ├── components/       # Componentes reutilizables
│   ├── contexts/         # Context API (estado global)
│   │   ├── AuthContext.tsx
│   │   ├── CustomerContext.tsx
│   │   ├── OrderContext.tsx
│   │   ├── ProductContext.tsx
│   │   ├── ConsumablesContext.tsx
│   │   ├── WorkerContext.tsx
│   │   ├── NotificationContext.tsx
│   │   └── ...
│   ├── pages/           # Páginas principales
│   │   ├── Dashboard.tsx
│   │   ├── Customers.tsx
│   │   ├── Workers.tsx
│   │   ├── Inventory.tsx
│   │   ├── Consumables.tsx
│   │   ├── POS.tsx
│   │   ├── Orders.tsx
│   │   ├── Movements.tsx
│   │   ├── Reports.tsx
│   │   ├── Services.tsx
│   │   ├── Appointments.tsx
│   │   ├── Settings.tsx
│   │   └── Login.tsx
│   ├── db/              # Scripts SQL y configuración de BD
│   ├── hooks/           # Custom hooks
│   ├── lib/             # Utilidades y configuración
│   ├── App.tsx          # Componente raíz
│   └── main.tsx         # Punto de entrada
├── public/              # Archivos estáticos
├── .env                 # Variables de entorno
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🔐 Configuración de Supabase

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia la URL y la Anon Key al archivo `.env`

### 2. Ejecutar Scripts SQL

Navega a la sección SQL Editor en Supabase y ejecuta los scripts ubicados en `src/db/` para crear las tablas necesarias:

- Clientes y vehículos
- Productos e insumos
- Órdenes y servicios
- Trabajadores
- Configuración
- Movimientos

---

## 📱 Funcionalidades por Módulo

### 🏠 Dashboard

- Vista general del negocio
- Métricas clave (ingresos, órdenes, clientes)
- Gráficos de rendimiento
- Acceso rápido a módulos principales

### 👥 Clientes

- CRUD completo de clientes
- Gestión de múltiples teléfonos por cliente
- Administración de vehículos asociados
- Carga de fotos de vehículos
- Búsqueda y filtrado avanzado

### 👷 Trabajadores

- Gestión de empleados
- Permisos por rol (admin/trabajador)
- Solo accesible para administradores
- Generación de QR para perfiles

### 📦 Inventario

- Control de productos
- Códigos de barras
- Alertas de stock bajo
- Historial de movimientos

### 🧴 Insumos

- Gestión de consumibles
- Tracking de entrada/salida
- Control de costos

### 💰 POS (Punto de Venta)

- Interfaz intuitiva de venta
- Búsqueda de clientes y vehículos
- Selección de servicios
- Generación de facturas PDF
- Cálculo automático de totales

### 📋 Órdenes

- Historial de órdenes
- Edición y eliminación
- Exportación a PDF
- Filtros por fecha, cliente, estado

### 📊 Reportes

- Visualización de datos
- Gráficos interactivos
- Exportación de datos
- Análisis de tendencias

### ⚙️ Configuración

- Personalización del negocio
- Horarios laborables
- Configuración de POS
- Parámetros generales

---

## 🧑‍💻 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Producción
npm run build           # Build de producción
npm run build:dev       # Build en modo desarrollo
npm run preview         # Preview del build de producción

# Código
npm run lint            # Ejecutar linter (ESLint)
```

---

## 🌐 Despliegue

### Opción 1: Lovable (Recomendado)

1. Abre [Lovable](https://lovable.dev/projects/18825a5f-4785-4ded-88c7-34dacbd758d7)
2. Haz clic en **Share → Publish**
3. La aplicación se desplegará automáticamente

### Opción 2: Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

El proyecto incluye un archivo `vercel.json` preconfigurado.

### Opción 3: Netlify

1. Conecta el repositorio a Netlify
2. Comando de build: `npm run build`
3. Directorio de publicación: `dist`

### Variables de Entorno en Producción

Asegúrate de configurar las siguientes variables en tu plataforma de hosting:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 🔒 Seguridad

- Autenticación mediante Supabase Auth
- Roles diferenciados (admin/trabajador)
- Protección de rutas según permisos
- Validación de formularios con Zod
- Variables de entorno para credenciales sensibles

---

## 🤝 Contribución

Si deseas contribuir al proyecto:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Soporte

Para reportar bugs o solicitar nuevas características, abre un issue en el repositorio.

---

## 📄 Licencia

Este proyecto es privado y propietario de Autolavado Gochi.

---

## 🎨 Personalización

### Cambiar Tema de Colores

Los colores principales se pueden modificar en `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      // Personaliza aquí tus colores
    }
  }
}
```

### Agregar Nuevos Módulos

1. Crear página en `src/pages/`
2. Crear contexto en `src/contexts/` (si es necesario)
3. Agregar ruta en `src/App.tsx`
4. Agregar link en el sidebar

---

## 🙏 Agradecimientos

- **shadcn/ui** por los componentes de UI
- **Supabase** por el backend
- **Lovable** por la plataforma de desarrollo

---

**Desarrollado con ❤️ para Autolavado Gochi**
