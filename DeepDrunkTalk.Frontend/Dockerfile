# Stage 1: Build the application
FROM node:20 AS builder

WORKDIR /app

# Set NODE_ENV to development to include devDependencies
ENV NODE_ENV=development

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies including devDependencies
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Setup the production environment
FROM node:20-slim

WORKDIR /app

# Copy only necessary files from the builder stage
COPY --from=builder /app/package.json /app/package.json
COPY --from=builder /app/build /app/build
COPY --from=builder /app/node_modules /app/node_modules

# Install only production dependencies
RUN npm install --production

# Expose the application port
EXPOSE 3000

# Start the application
CMD ["npm", "run", "start"]
