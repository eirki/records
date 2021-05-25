# build environment
FROM node:14.15.5 as build

# https://stackoverflow.com/questions/44633419/no-access-permission-error-with-npm-global-install-on-docker-image
ENV USER=node
ENV PATH="/home/node/.npm-global/bin:${PATH}"
ENV NPM_CONFIG_PREFIX="/home/node/.npm-global"
# All subsequent commands are run as the `node` user.
USER node
WORKDIR /home/node
# make dir here to avoid permission error
RUN mkdir -p ./frontend/dist

COPY package*.json ./
RUN npm install

COPY ./frontend/src ./frontend/src
COPY rollup.config.js ./
RUN ./node_modules/.bin/rollup -c rollup.config.js
COPY ./frontend/static ./frontend/static
COPY ./frontend/templates ./frontend/templates

# prod environment
FROM python:3.9-slim-buster

COPY requirements.txt /tmp/

RUN useradd --create-home appuser
WORKDIR /home/appuser
USER appuser

RUN python -m venv venv && venv/bin/pip install -r /tmp/requirements.txt

COPY backend ./backend
COPY --from=build /home/node/frontend ./frontend

CMD ["venv/bin/uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "80"]