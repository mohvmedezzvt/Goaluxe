# A lightweight Node.js image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# For caching, copy package.json and lock file first
COPY packages/backend/package.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy the rest of backend source code into the container
COPY packages/backend ./

# Expose the port that the server listens on
EXPOSE 3001

# Define the command to run the backend server
CMD ["node", "server.js"]
