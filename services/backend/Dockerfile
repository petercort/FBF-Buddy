# Use the official Node.js image as the base image
FROM node:23-slim

# Define environment variables for Azure secrets
ARG KEY_VAULT_NAME
ARG AZURE_CLIENT_ID
ARG AZURE_TENANT_ID
ARG AZURE_CLIENT_SECRET
ARG DISCORD_BOT_API_URL

ENV AZURE_CLIENT_ID=$AZURE_CLIENT_ID
ENV AZURE_TENANT_ID=$AZURE_TENANT_ID
ENV AZURE_CLIENT_SECRET=$AZURE_CLIENT_SECRET
ENV KEY_VAULT_NAME=$KEY_VAULT_NAME
ENV DISCORD_BOT_API_URL=$DISCORD_BOT_API_URL

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json if exists
COPY package.json ./

# Install dependencies without lockfile to avoid npm issues
RUN npm install --omit=dev --no-package-lock

# Copy the rest of the application code
COPY . .

# Expose the backend API port
EXPOSE 3000

# Define the command to run the application
CMD ["npm", "run", "start"]
