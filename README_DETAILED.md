# 🎨 Frontend - Lumina Finance UI

> Interfaz moderna en React + Vite para gestión inteligente de finanzas personales.

![React](https://img.shields.io/badge/react-19-61dafb?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/vite-7.3-646cff?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-4-06b6d4?style=flat-square&logo=tailwind-css)
![Node](https://img.shields.io/badge/node-18+-green?style=flat-square)

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Scripts Disponibles](#scripts-disponibles)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Componentes Principales](#componentes-principales)
- [Manejo de Estado](#manejo-de-estado)
- [Variables de Entorno](#variables-de-entorno)
- [Desarrollo](#desarrollo)
- [Build & Deployment](#build--deployment)
- [Troubleshooting](#troubleshooting)

## ✨ Características

### 📊 Dashboard

- Resumen de ingresos, gastos y deudas
- Widgets interactivos con datos en tiempo real
- Gráficos de tendencias mensuales
- Estado de presupuestos al vistazo

### 💳 Transacciones

- Registro fácil de ingresos y gastos
- Selector de categorías con dropdown
- Métodos de pago (efectivo, tarjeta)
- Selector de tarjeta de crédito
- Historial filtrable

### 📈 Presupuestos

- Crear límites de gastos por categoría
- Visualización de progreso con barras
- Alertas cuando se aproxima al límite
- Seguimiento en tiempo real

### 💰 Deudas

- Crear deudas con cronograma automático
- **Especificar fecha inicio y vencimiento**
- **Listar cuotas mensuales con estado** (pagada/pendiente)
- Marcar pagos individuales como realizados
- Visualización de deudas pendientes

### 💳 Tarjetas de Crédito

- Registrar tarjetas con límite
- Visualizar uso vs disponible
- Historial de transacciones por tarjeta
- Gestión intuitiva de tarjetas

### 📋 Categorías

- Sistema con categorías predefinidas
- Asignación automática para ingresos
- Dropdown selector para gastos

### 📊 Reportes

- Gráficos de gastos por categoría
- Evolución de ingresos vs gastos
- Estadísticas mensuales
- Exportación de datos

## 📦 Requisitos

- **Node.js 18+** (verificar con `node -v`)
- **npm 9+** (verificar con `npm -v`)
- Backend API corriendo en `http://localhost:8000`

### Versiones de Dependencias Principales

| Paquete          | Versión | Descripción       |
| ---------------- | ------- | ----------------- |
| react            | 19.2.0  | UI Framework      |
| react-dom        | 19.2.0  | React DOM binding |
| vite             | 7.3.1   | Build tool        |
| tailwindcss      | 4       | Styling           |
| axios            | latest  | HTTP client       |
| recharts         | 3.7.0   | Gráficos          |
| lucide-react     | latest  | Iconos            |
| react-router-dom | latest  | Routing           |

## 🚀 Instalación

### 1. Clonar o Descargar Repositorio

```bash
git clone https://github.com/usuario/lumina-finance.git
cd lumina-finance/frontend
```

### 2. Instalar Dependencias

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env.local` en la carpeta frontend:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=Lumina Finance
VITE_DEBUG=true
```

### 4. Verificar Backend

Asegurarse que el backend está corriendo:

```bash
# En otra terminal, desde backend/
python run.py
# Debe estar disponible en http://localhost:8000
```

### 5. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

El frontend estará disponible en: **http://localhost:5173**

## 📜 Scripts Disponibles

### Desarrollo

```bash
# Iniciar servidor de desarrollo con hot reload
npm run dev

# Abrir en navegador automáticamente
npm run dev -- --open
```

### Production

```bash
# Compilar para producción
npm run build

# Previsualizr build localmente
npm run preview

# Servir estátically (una vez buildeado)
npx serve dist
```

### Quality

```bash
# Ejecutar ESLint (si está configurado)
npm run lint

# Formatear código con Prettier (si está configurado)
npm run format
```

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── App.jsx                     # 🚀 Componente raíz
│   ├── main.jsx                    # 📍 Punto de entrada
│   ├── index.css                   # 🎨 Estilos globales
│   │
│   ├── components/
│   │   └── ui/
│   │       ├── Card.jsx            # Tarjeta genérica
│   │       ├── Button.jsx          # Botón reutilizable
│   │       └── Input.jsx           # Input reutilizable
│   │
│   ├── context/
│   │   └── AuthContext.jsx         # 🔐 Estado autenticación
│   │
│   ├── hooks/
│   │   ├── useAuth.js              # Hook para auth
│   │   ├── useFetch.js             # Hook para fetch
│   │   └── useLocalStorage.js      # Hook localStorage
│   │
│   ├── layouts/
│   │   └── DashboardLayout.jsx     # Layout principal
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx           # 📊 Panel principal
│   │   ├── Transactions.jsx        # 💵 Ingresos/Gastos
│   │   ├── Debts.jsx               # 💳 Deudas + Cronograma ⭐
│   │   ├── Budgets.jsx             # 💰 Presupuestos
│   │   ├── CreditCards.jsx         # 💳 Tarjetas
│   │   ├── Reports.jsx             # 📈 Reportes
│   │   ├── Login.jsx               # 🔑 Login
│   │   └── NotFound.jsx            # 404
│   │
│   └── services/
│       └── api.js                  # 🔗 Cliente HTTP (axios)
│
├── public/
│   └── assets/                     # 🖼️  Imágenes/recursos estáticos
│
├── .env.local                      # ⛔ Variables entorno (NO commitar)
├── .env.example                    # 📝 Template para .env
├── .eslintrc.cjs                   # 📋 Config ESLint
├── eslint.config.js                # 📋 Config ESLint nuevo
├── postcss.config.js               # 📋 Config PostCSS
├── tailwind.config.js              # 🎨 Config TailwindCSS
├── vite.config.js                  # ⚙️  Config Vite
├── index.html                      # 📄 HTML principal
├── package.json                    # 📦 Dependencias
├── package-lock.json               # 📦 Lock file
└── README.md                       # 📖 Este archivo
```

## 🧩 Componentes Principales

### Card.jsx

Componente genérico para tarjetas:

```jsx
<Card className="mb-4">
  <h2>Título</h2>
  <p>Contenido</p>
</Card>
```

### Button.jsx

Botón reutilizable con variantes:

```jsx
<Button variant="primary">Acción</Button>
<Button variant="ghost">Cancelar</Button>
<Button size="sm">Pequeño</Button>
```

### Input.jsx

Input con label integrado:

```jsx
<Input
  label="Email"
  type="email"
  placeholder="tu@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  required
/>
```

## 🔐 Manejo de Estado

### AuthContext.jsx

Contexto global para autenticación:

```jsx
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function MiComponente() {
  const { user, token, login, logout } = useContext(AuthContext);

  // Use el contexto aquí
}
```

**Propiedades disponibles**:

- `user`: Usuario logueado
- `token`: JWT token
- `loading`: Cargando autenticación
- `login(email, password)`: Función login
- `logout()`: Función logout
- `isAuthenticated()`: Verificar si está logueado

## 🌐 Variables de Entorno

### `.env.local`

```env
# API Backend
VITE_API_URL=http://localhost:8000/api/v1

# App
VITE_APP_NAME=Lumina Finance
VITE_APP_VERSION=1.0.0

# Dev
VITE_DEBUG=true
VITE_LOG_LEVEL=debug

# Features (featureFlagging)
VITE_FEATURE_REPORTS=true
VITE_FEATURE_BUDGETS=true
VITE_FEATURE_DEBT_SCHEDULE=true
```

## 💻 Desarrollo

### Hot Module Replacement (HMR)

Vite soporta HMR automático. Los cambios se reflejan en tiempo real sin perder el estado de la aplicación.

### Debugging

```js
// En consola del navegador
localStorage.setItem("DEBUG", "true");

// O en código
if (import.meta.env.VITE_DEBUG === "true") {
  console.log("Debug habilitado");
}
```

### Redux DevTools (Optional)

Si necesitas visualizar estado más complejo, considera agregar Redux DevTools:

```bash
npm install redux-devtools-extension
```

### Navegación

Rutas configuradas en `src/App.jsx`:

```jsx
<Routes>
  <Route path="/" element={<Dashboard />} />
  <Route path="/transactions" element={<Transactions />} />
  <Route path="/debts" element={<Debts />} />
  <Route path="/budgets" element={<Budgets />} />
  <Route path="/credit-cards" element={<CreditCards />} />
  <Route path="/reports" element={<Reports />} />
</Routes>
```

## 🔗 Conectar con Backend

El cliente HTTP está en `src/services/api.js`:

```javascript
import api from '../services/api'

// GET
const response = await api.get('/debts')

// POST
const response = await api.post('/debts', {
  creditor: 'Banco XYZ',
  total_amount: 5000,
  ...
})

// PATCH
await api.patch(`/debts/${id}`, { amount: 6000 })

// DELETE
await api.delete(`/debts/${id}`)
```

**Manejo de errores:**

```javascript
try {
  await api.post("/debts", data);
} catch (error) {
  if (error.response?.status === 401) {
    // Token expirado, hacer logout
  } else {
    console.error(error.response?.data?.detail || error.message);
  }
}
```

## 🎯 Features Detalladas

### Cronograma de Deudas 📅 (NEW)

Página: `/pages/Debts.jsx`

**Crear deuda con cronograma**:

1. Click "Nueva Deuda"
2. Llenar formulario:
   - Acreedor: "Banco ABC"
   - Monto Total: 5000
   - Pago Mensual: 500
   - **Fecha Inicio**: 15/03/2026 (cuándo empieza)
   - **Fecha Vencimiento**: 15/12/2026 (hasta cuándo)
3. Sistema genera automáticamente todas las cuotas

**Visualizar cronograma**:

- Botón "▶ Cronograma" en cada deuda
- Expande lista de cuotas mensuales
- Colores por estado:
  - 🟢 Verde = Pagada
  - 🔴 Rojo = Vencida (overdue)
  - 🟡 Amarillo = Próxima (< 7 días)
  - ⚪ Gris = Futura

**Marcar como pagado**:

- Click "Marcar Pagado" en cuota pendiente
- Sistema actualiza automáticamente el balance

### Transacciones 💵

**Ingresos**: Automáticamente asigna categoría "Salario"
**Gastos**: Selecciona categoría del dropdown
**Tarjeta Crédito**: Selecciona método y tarjeta

### Presupuestos 💰

Crear límite de gasto mensual por categoría:

```jsx
POST /budgets
{
  "category_id": 5,
  "amount": 500.00
}
```

Sistema muestra:

- Barra de progreso
- % usado
- Monto disponible

### Tarjetas 💳

Registrar límite de crédito:

```jsx
POST /credit-cards
{
  "name": "Visa Platinum",
  "credit_limit": 15000.00
}
```

Visualizar:

- Disponible vs Usado
- Transacciones por tarjeta
- % de utilización

## 🛠️ Build & Deployment

### Compilar para Producción

```bash
npm run build
```

Genera carpeta `dist/` lista para servir:

```bash
# Probar build localmente
npm run preview

# Después servir en tu servidor
# Nginx, Apache, Firebase Hosting, Vercel, etc.
```

### Opciones de Deployment

#### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init
firebase deploy
```

#### Vercel

```bash
npm install -g vercel
vercel
```

#### Netlify

```bash
# Drag & drop carpeta dist/ a Netlify
# O:
npm run build && npx netlify-cli deploy --prod
```

#### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 🐛 Troubleshooting

### "Cannot find module" error

**Solución**:

```bash
# Limpiar dependencias
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

### Backend API no responde

**Verificar**:

```bash
# ¿Está el backend corriendo?
curl http://localhost:8000/docs

# ¿Variable de entorno correcta?
# En .env.local:
VITE_API_URL=http://localhost:8000/api/v1

# ¿CORS habilitado en backend?
```

### CORS Error

**Solución**: Backend debe tener CORS configurado:

```python
# app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Token expirado

**Síntomas**: Redirecciona a login constantemente

**Solución**:

- Aumentar `ACCESS_TOKEN_EXPIRE_MINUTES` en backend `.env`
- O implementar refresh token

### Estilos TailwindCSS no se aplican

**Solución**:

```bash
# Reiniciar servidor
npm run dev

# Limpiar caché
rm -rf dist/
npm run build
```

### "[plugin:vite:react-babel]" error

**Solución**:

```bash
# Actualizar dependencias
npm update

# O reinstalar todo
rm -rf node_modules package-lock.json
npm install
```

## 📚 Recursos

- [React 19 Docs](https://react.dev)
- [Vite Guide](https://vitejs.dev/guide/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/)
- [Axios](https://axios-http.com/)
- [React Router](https://reactrouter.com/)

## 📝 Notas Importantes

- **⛔ NO commitar `.env.local`**: Puede contener credenciales
- **🎨 TailwindCSS**: Usar clases directamente, no CSS custom
- **📦 Dependencias**: Verificar compatibilidad antes de actualizar
- **🔐 Secretos**: Nunca hardcodear API keys o tokens

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature: `git checkout -b feature/AmazingFeature`
3. Commit cambios: `git commit -m 'Add AmazingFeature'`
4. Push a rama: `git push origin feature/AmazingFeature`
5. Abrir Pull Request

## 📧 Soporte

- Discord: [Servidor Lumina](https://discord.gg/lumina)
- Email: support@luminafinance.com
- Issues: GitHub Issues

## 📄 Licencia

MIT License - Ver [LICENSE](../LICENSE) para detalles

---

**Última actualización**: Febrero 2026  
**Versión**: 1.0.0  
**Credenciales Demo**:

- Email: admin@lumina.com
- Password: admin123
