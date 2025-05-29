# Single-stage build for Railway efficiency
FROM node:20-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production

# Copy package files AND prisma schema first
COPY package.json yarn.lock ./
COPY prisma ./prisma

# Install ALL dependencies (postinstall will run prisma generate)
RUN yarn install --frozen-lockfile --network-timeout 1000000

# Copy source code
COPY . .

# Build the application (tsc-alias is needed here)
RUN yarn build

# Remove dev dependencies to reduce size AFTER build
RUN yarn install --production --frozen-lockfile && yarn cache clean

EXPOSE 3000

CMD ["yarn", "start:prod"]