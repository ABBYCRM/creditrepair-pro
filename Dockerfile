FROM node:20-alpine
WORKDIR /app
COPY deploy/dist/ ./dist/
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node", "dist/boot.js"]
