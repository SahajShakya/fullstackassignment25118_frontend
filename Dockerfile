FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Set default environment variables for Vite
ENV VITE_GRAPHQL_URL=http://localhost:9090/graphql
ENV VITE_WS_GRAPHQL_URL=ws://localhost:9090/graphql
ENV VITE_WS_URL=ws://localhost:9090/api/ws
ENV VITE_API_URL=http://localhost:9090

EXPOSE 3000

CMD ["npm", "run", "dev"]
