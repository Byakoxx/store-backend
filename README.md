# 🛒 Store Backend API

API backend completa para un e-commerce con integración de pagos Wompi, gestión de productos, transacciones y entregas.

## 🚀 Características

### 🛒 Gestión de Productos

- **GET /v1/products** - Lista todos los productos disponibles
- **GET /v1/products/:id** - Obtiene un producto específico
- Base de datos sembrada con productos dummy
- Control automático de stock

### 👤 Gestión de Clientes

- Registro automático de clientes durante transacciones
- No requiere autenticación previa
- Asociación con transacciones y entregas

### 💳 Procesamiento de Pagos

- **POST /v1/transactions** - Crear nueva transacción
- **PATCH /v1/transactions/:id/status** - Actualizar estado
- **GET /v1/transactions** - Listar transacciones
- Integración completa con Wompi API
- Manejo de estados: CREATED → PENDING → APPROVED/DECLINED

### 📦 Gestión de Entregas

- **GET /v1/deliveries/transaction/:transactionId** - Consultar entrega
- Estados: CREATED → PREPARING → IN_TRANSIT → DELIVERED
- Información completa de dirección (país, ciudad, dirección, código postal)

### 🔔 Webhooks y Polling

- **POST /v1/webhooks/wompi** - Webhook de confirmación de Wompi
- Sistema de polling automático para verificar estados
- Actualización automática de stock al aprobar pagos

## 🏗️ Arquitectura

### Arquitectura Hexagonal (Ports & Adapters)

```
src/
├── domain/                 # Entidades y reglas de negocio
│   ├── models/            # Product, Transaction, Delivery, Customer
│   └── ports-out/         # Interfaces de repositories
├── application/           # Casos de uso y servicios
│   ├── use-cases/        # CreateTransaction, GetProducts, etc.
│   └── services/         # TransactionPolling, ProductService
└── adapters/
    ├── in/               # Controllers HTTP
    └── out/              # Repositories, External APIs
        ├── persistence/  # Prisma repositories
        └── external/     # Wompi integration
```

### Stack Tecnológico

- **Framework:** NestJS + TypeScript
- **Base de Datos:** PostgreSQL + Prisma ORM
- **Documentación:** Swagger/OpenAPI
- **Validación:** Class-validator
- **Seguridad:** Helmet + CORS
- **Testing:** Jest
- **Containerización:** Docker

## ⚙️ Configuración del Proyecto

### Prerrequisitos

- Node.js 18+
- Docker & Docker Compose
- Yarn

### 1. Clonar e instalar dependencias

```bash
git clone <repository-url>
cd store-backend
yarn install
```

### 2. Variables de entorno

Crear archivo `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/store_db"
WOMPI_API_URL="https://sandbox.wompi.co/v1"
WOMPI_PRIVATE_KEY="your_private_key"
WOMPI_PUBLIC_KEY="your_public_key"
WOMPI_INTEGRITY_SIGNATURE="your_integrity_signature"
PORT=3000
```

### 3. Levantar base de datos

```bash
docker-compose up -d
```

### 4. Ejecutar migraciones y seed

```bash
npx prisma migrate dev
yarn seed
```

### 5. Iniciar aplicación

```bash
# Desarrollo
yarn start:dev

# Producción
yarn build
yarn start:prod
```

## 📖 Documentación API

### Swagger UI

Una vez iniciado el servidor, visita:

- **Swagger:** http://localhost:3000/api
- **API Base:** http://localhost:3000/v1

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
# Tests unitarios
yarn test

# Coverage
yarn test:cov

# Tests e2e
yarn test:e2e
```

## 🔧 Scripts Disponibles

```bash
yarn start          # Iniciar en producción
yarn start:dev      # Iniciar en desarrollo (watch mode)
yarn build          # Compilar proyecto
yarn test           # Ejecutar tests
yarn test:cov       # Coverage de tests
yarn lint           # Linter
yarn format         # Prettier
yarn seed           # Seed de base de datos
```

## 🛡️ Seguridad

- **Helmet:** Headers de seguridad HTTP
- **CORS:** Configurado para peticiones cross-origin
- **Validación:** DTOs validados con class-validator
- **Variables sensibles:** Manejo seguro con .env

## 🌊 Flujo de Negocio

1. **Cliente** hace petición a `POST /v1/transactions`
2. **Backend** valida datos y crea transacción local
3. **Wompi** procesa el pago y responde
4. **Si PENDING:** Se crea delivery en estado `CREATED`
5. **Polling/Webhook** detecta cambio a `APPROVED`
6. **Sistema** actualiza delivery a `PREPARING` y reduce stock
7. **Cliente** puede consultar estado via `GET /v1/deliveries/transaction/:id`

## 🚀 Deployment

### Docker

```bash
# Build
docker build -t store-backend .

# Run
docker run -p 3000:3000 store-backend
```

### Docker Compose

```bash
docker-compose up --build
```

## 📂 Estructura de Base de Datos

### Entidades Principales

- **Product:** productos del catálogo
- **Customer:** clientes registrados
- **Transaction:** transacciones de pago
- **Delivery:** información de entregas

### Relaciones

- Transaction → Customer (many-to-one)
- Transaction → Product (many-to-one)
- Delivery → Transaction (one-to-one)
- Delivery → Customer (many-to-one)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama feature (`git checkout -b feature/nueva-feature`)
3. Commit tus cambios (`git commit -am 'Add nueva feature'`)
4. Push a la rama (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

---

**Desarrollado con ❤️ usando NestJS y arquitectura hexagonal**
