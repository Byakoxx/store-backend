# 🛒 Store Backend

API backend completa para un e-commerce con integración de pagos Gateway, gestión de productos, transacciones y entregas.

## 🚀 Características

- **Arquitectura Hexagonal** - Clean Architecture con separación clara de responsabilidades
- **NestJS Framework** - Framework Node.js escalable y mantenible
- **Prisma ORM** - Base de datos type-safe con PostgreSQL
- **Docker Ready** - Containerización completa
- **Testing** - Cobertura de tests unitarios
- **ESLint + Prettier** - Código limpio y consistente
- **TypeScript** - Tipado estático para mayor robustez

## 📋 Funcionalidades

### 🛍️ Productos

- **GET /v1/products** - Listar productos disponibles
- **GET /v1/products/:id** - Obtener producto específico
- Gestión automática de stock

### 💳 Transacciones

- **POST /v1/transactions** - Crear nueva transacción
- **PATCH /v1/transactions/:id/status** - Actualizar estado
- **GET /v1/transactions** - Listar transacciones
- Integración completa con Payment Gateway API
- Manejo de estados: CREATED → PENDING → APPROVED/DECLINED

### 🚚 Entregas

- **GET /v1/deliveries/transaction/:id** - Consultar entrega por transacción
- Estados: CREATED → PREPARING → IN_TRANSIT → DELIVERED
- Asociación automática con transacciones aprobadas

### 🎣 Webhooks

- **POST /v1/webhooks/payment** - Webhook de confirmación del Gateway

## 🏗️ Arquitectura

```
src/
├── adapters/
│   ├── in/http/         # Controllers y DTOs
│   └── out/
│       ├── persistence/ # Repositories con Prisma
│       └── external/    # Payment Gateway integration
├── application/         # Use cases y servicios
├── domain/             # Entidades y puertos
└── shared/             # Utilidades compartidas
```

## ⚙️ Configuración

### Variables de Entorno

```bash
# Base de datos
DATABASE_URL="postgresql://user:password@localhost:5432/store"

# Gateway de Pagos
PAYMENT_API_URL="https://sandbox.payment.co/v1"
PAYMENT_PRIVATE_KEY="your_private_key"
PAYMENT_PUBLIC_KEY="your_public_key"
PAYMENT_INTEGRITY_SIGNATURE="your_integrity_signature"

# Servidor
PORT=3000
NODE_ENV=development
```

## 🚀 Despliegue en Railway

### 1. Preparar el repositorio

```bash
# Asegúrate de que todos los cambios estén commiteados
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Desplegar en Railway

1. Ve a [railway.app](https://railway.app)
2. Haz clic en "Start a New Project"
3. Selecciona "Deploy from GitHub repo"
4. Autoriza Railway a acceder a tu repositorio
5. Selecciona tu repositorio `store-backend`
6. Railway detectará automáticamente que es una aplicación Node.js

### 3. Configurar PostgreSQL

1. En tu proyecto Railway, haz clic en "New Service"
2. Selecciona "Database" → "PostgreSQL"
3. Railway creará automáticamente la base de datos
4. Copia la `DATABASE_URL` que aparece en las variables de entorno

### 4. Configurar Variables de Entorno

En Railway, ve a tu servicio backend → Variables y agrega:

```
DATABASE_URL=postgresql://... (la que te dio Railway)
PAYMENT_API_URL=https://sandbox.payment.co/v1
PAYMENT_PRIVATE_KEY=tu_clave_privada
PAYMENT_PUBLIC_KEY=tu_clave_publica
PAYMENT_INTEGRITY_SIGNATURE=tu_firma_integridad
NODE_ENV=production
```

### 5. Primera migración

Railway ejecutará automáticamente:

```bash
npm run build
npx prisma migrate deploy
npm start
```

### 6. URL de tu API

Railway te dará una URL como: `https://tu-app.railway.app`

## 📖 Documentación API

### Swagger UI

Una vez desplegado, visita:

- **Swagger:** https://tu-app.railway.app/api
- **API Base:** https://tu-app.railway.app/v1

### Ejemplos de uso

#### Crear Transacción

```bash
POST /v1/transactions
Content-Type: application/json

{
  "productId": "prod-1",
  "amount": 300000,
  "currency": "COP",
  "paymentToken": "tok_test_123",
  "customer": {
    "name": "Juan Pérez",
    "email": "juan@example.com"
  },
  "items": 2,
  "delivery": {
    "country": "Colombia",
    "city": "Bogotá",
    "address": "Calle 123 #45-67",
    "zipCode": "110111"
  }
}
```

#### Consultar Entrega

```bash
GET /v1/deliveries/transaction/uuid-transaction-id
```

## 🧪 Testing

```bash
# Ejecutar tests
npm run test

# Coverage
npm run test:cov

# Tests e2e
npm run test:e2e
```

## 🐳 Docker Local

```bash
# Construir y ejecutar
docker-compose up --build

# Solo base de datos
docker-compose up postgres
```

## 📝 Scripts Disponibles

```bash
npm run build          # Construir para producción
npm run start          # Iniciar aplicación
npm run start:dev      # Desarrollo con watch
npm run start:prod     # Producción
npm run test           # Tests unitarios
npm run test:cov       # Tests con coverage
npm run lint           # Linter
npm run format         # Prettier
```

## 🌟 Características Técnicas

- **Cobertura de Tests:** 85%+
- **Arquitectura Hexagonal** con puertos y adaptadores
- **Inyección de Dependencias** con NestJS
- **Validación de DTOs** automática
- **Documentación Swagger** auto-generada
- **Manejo de errores** centralizado
- **Logging** estructurado
- **Variables de entorno** tipadas
