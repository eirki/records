# build environment
FROM node:16.16.0 as build

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
# RUN node_modules/.bin/vue-tsc --noEmit
RUN node_modules/.bin/vite build

# prod environment
FROM python:3.9-slim-buster

COPY requirements.txt /tmp/

RUN useradd --create-home appuser
WORKDIR /home/appuser
USER appuser

RUN python -m venv venv && venv/bin/pip install -r /tmp/requirements.txt

COPY backend ./backend
COPY --from=build /home/node ./frontend

CMD ["venv/bin/uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "80"]
