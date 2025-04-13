# Step 1: Specify the base image
FROM node:23-slim

WORKDIR /usr

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

USER node 

COPY . .

EXPOSE 3000

CMD ["npm", "start"]