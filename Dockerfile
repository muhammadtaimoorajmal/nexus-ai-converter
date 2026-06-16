FROM node:18

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies for the entire monorepo automatically
RUN npm install

# Copy source code
COPY . .

# Expose ports
EXPOSE 3000
EXPOSE 5000

# Start command
CMD ["npm", "run", "dev"]
