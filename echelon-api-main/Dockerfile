FROM node:22-alpine AS builder

WORKDIR /app
COPY . /app/builder/
RUN cd /app/builder && npm install && npm run build


FROM node:22-alpine

WORKDIR /app


COPY --from=builder /app/builder/dist/ /app/dist/
COPY --from=builder /app/builder/node_modules/ /app/node_modules/

COPY --from=builder /app/builder/email-template/ /app/email-template/


ENTRYPOINT [ "node", "/app/dist/main.js" ]