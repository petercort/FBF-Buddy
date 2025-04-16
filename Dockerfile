# Use the official Node.js image as the base image
FROM node:23-slim

# Define an environment variable for the secret
ARG KEY_VAULT_NAME

# Pass the secret as an environment variable
ENV KEY_VAULT_NAME=$KEY_VAULT_NAME

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --omit=dev

# Copy the rest of the application code
COPY . .

# Expose the application port
EXPOSE 3000

# Define the command to run the application
CMD ["node", "src/app.js"]