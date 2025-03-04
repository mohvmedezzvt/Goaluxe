# A lightweight Node.js image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# monorepo root files needed for workspace installs
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy the backend package folder into the container
COPY packages/backend packages/backend

# Install pnpm globally and install dependencies only for the backend package
RUN npm install -g pnpm && pnpm install --filter ./packages/backend...

# Change working directory to the backend package
WORKDIR /app/packages/backend

# Expose the port that the server listens on
EXPOSE 3001

# Define the command to run the backend server
CMD ["node", "server.js"]
