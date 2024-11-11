# Step 1: Specify the base image
FROM node:20

WORKDIR /usr/src

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

USER node 

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]