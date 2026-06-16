FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY apps/frontend/package*.json ./apps/frontend/
COPY apps/backend/package*.json ./apps/backend/
COPY packages/shared/package*.json ./packages/shared/

# Install dependencies
RUN npm install
RUN npm install --prefix apps/frontend
RUN npm install --prefix apps/backend

# Copy source code
COPY . .

# Expose ports
EXPOSE 3000
EXPOSE 5000

# Start command
CMD ["npm", "run", "dev"]
