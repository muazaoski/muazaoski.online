FROM node:20-alpine

WORKDIR /app

COPY server.mjs ./
RUN mkdir -p /app/data

ENV PORT=3050
EXPOSE 3050

CMD ["node", "server.mjs"]
