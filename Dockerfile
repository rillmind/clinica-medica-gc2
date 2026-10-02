FROM node:20-alpine

WORKDIR /app

COPY --chown=node:node package*.json ./
RUN npm ci --ignore-scripts

COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node src/ ./src/

USER node

EXPOSE 3000

CMD ["npm", "run", "dev"]
