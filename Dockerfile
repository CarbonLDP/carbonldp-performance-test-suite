FROM node:9-alpine

COPY node_modules /home/node/app/node_modules
COPY package.json /home/node/app/package.json
COPY dist /home/node/app/dist

WORKDIR /home/node/app

ENTRYPOINT [ "/bin/ash", "-c", "node dist \"$@\"", "-C" ]