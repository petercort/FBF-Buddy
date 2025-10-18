# Use the official Node.js image as the base image
FROM node:24-slim

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json if exists
COPY package.json ./

# Install dependencies without lockfile to avoid npm issues
RUN npm install --omit=dev --no-package-lock

# Copy the rest of the application code
COPY . .

# Expose the Discord bot API port
EXPOSE 3001

# Define the command to run the application
CMD ["npm", "run", "start"]
