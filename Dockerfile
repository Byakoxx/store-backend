# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy source code and prisma schema
COPY . .

# Generate Prisma client and build
RUN yarn prisma generate
RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json yarn.lock ./

# Install production dependencies
RUN yarn install --production --frozen-lockfile

# Copy prisma schema for runtime
COPY prisma/ ./prisma/

# Generate Prisma client for production
RUN yarn prisma generate

# Copy built application
COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["yarn", "start:prod"]