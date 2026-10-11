# Use the official Node.js image as the base image
FROM node:24-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy dependency manifests first for reproducible, cacheable installs
COPY package.json package-lock.json ./

# Install production dependencies from the lockfile
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the backend API port
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "run", "start"]
