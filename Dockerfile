# Use the official Node.js image as the base image
FROM node:24-slim

# Define an environment variable for the secret
ARG KEY_VAULT_NAME
ARG AZURE_CLIENT_ID
ARG AZURE_TENANT_ID
ARG AZURE_CLIENT_SECRET

ENV AZURE_CLIENT_ID=$AZURE_CLIENT_ID
ENV AZURE_TENANT_ID=$AZURE_TENANT_ID
ENV AZURE_CLIENT_SECRET=$AZURE_CLIENT_SECRET
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
CMD ["npm", "run", "start"]