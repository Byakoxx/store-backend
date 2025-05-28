# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install

COPY . .

RUN yarn build

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY yarn.lock ./

RUN yarn install --production

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["yarn", "start:prod"] 