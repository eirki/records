FROM golang:1.22 as build_backend

WORKDIR /app

COPY go.mod ./
COPY go.sum ./

RUN go mod download

COPY main.go .
COPY backend ./backend

# https://stackoverflow.com/questions/55106186/no-such-file-or-directory-with-docker-scratch-image
RUN CGO_ENABLED=0 go build -o server


FROM node:20.18.1 as build_frontend

# https://stackoverflow.com/questions/44633419/no-access-permission-error-with-npm-global-install-on-docker-image
USER node
ENV USER=node
ENV PATH="/home/node/.npm-global/bin:${PATH}"
ENV NPM_CONFIG_PREFIX="/home/node/.npm-global"
# All subsequent commands are run as the `node` user.
WORKDIR /home/node
# make dir here to avoid permission error
RUN mkdir -p ./dist

COPY --chown=node:node frontend/package-lock.json .
COPY frontend/package.json .
RUN npm install
COPY frontend/src src
# cannot compile without dev-data, not ideal
COPY frontend/dev-data dev-data
COPY frontend/index.html .
COPY frontend/tsconfig.json .
COPY frontend/tsconfig.node.json .
COPY frontend/vite.config.ts .
RUN node_modules/.bin/vite build

# prod environment
FROM scratch

WORKDIR /

# https://stackoverflow.com/questions/52969195/docker-container-running-golang-http-client-getting-error-certificate-signed-by
COPY --from=build_backend /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=build_backend /app/server ./server
COPY --from=build_frontend /home/node ./frontend

USER 1001

ENTRYPOINT ["/server"]
