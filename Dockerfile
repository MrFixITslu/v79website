FROM node:24-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run lint && npm run build

FROM node:24-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production PORT=3000
COPY --chmod=0644 --chown=node:node package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder --chown=node:node /app/dist ./dist
RUN mkdir -p /app/data /app/uploads && chown node:node /app/data /app/uploads
USER node
# Prove that the unprivileged runtime can read files even from a 0600 staging checkout.
RUN node -e "for (const f of ['package.json', 'package-lock.json']) JSON.parse(require('fs').readFileSync('/app/'+f, 'utf8'))"
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD node -e "fetch('http://127.0.0.1:3000/api/ready').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "dist/server/server.cjs"]
