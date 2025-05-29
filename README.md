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

```

```
