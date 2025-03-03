# A lightweight Node.js image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# For caching, copy package.json and lock file first
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of frontend source code into the container
COPY . .

# Build the Next.js application for production
RUN npm run build

# The port that Next.js will run on
EXPOSE 3000

# Start the Next.js server
CMD ["npm", "start"]
