# Single-stage build for Railway efficiency
FROM node:20-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy package files first (better caching)
COPY package.json yarn.lock ./

# Install ALL dependencies first (including dev for build)
RUN yarn install --frozen-lockfile --network-timeout 1000000

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma client
RUN npx prisma generate

# Copy source code
COPY . .

# Build the application
RUN yarn build

# Remove dev dependencies to reduce size
RUN yarn install --production --frozen-lockfile && yarn cache clean

EXPOSE 3000

CMD ["yarn", "start:prod"]