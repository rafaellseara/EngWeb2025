FROM node:22.1.0-alpine

WORKDIR /usr/src/app

COPY . .

RUN npm install

EXPOSE 3001

CMD ["npm", "run", "dev"]
