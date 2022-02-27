FROM node:16-alpine

RUN apk --update add \
        git \
        && rm -fr /var/cache/apk/*


COPY . /repo

WORKDIR /repo

RUN npm install && npm run build

CMD ["npm", "run", "start"]
