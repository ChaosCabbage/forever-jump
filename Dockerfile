FROM node:12
WORKDIR /app
COPY index.js /app
COPY package.json /app
COPY package-lock.json /app
COPY public /app/public
RUN npm install

CMD ["node", "index.js"]
