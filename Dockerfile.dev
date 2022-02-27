FROM node:16-alpine

RUN apk --update add \
        git \
        && rm -fr /var/cache/apk/*

WORKDIR /repo

CMD ["sh", "-c", "npm i && npm run dev-start"]
