# The Multiple Tracker

This is a test for The Multiple.

## Using this Test

### Configure env vars:

Create a _.env_ file with this variables (the values are examples):

```bash
MONGO_INITDB_ROOT_USERNAME=user
MONGO_INITDB_ROOT_PASSWORD=pass
MONGO_INITDB_DATABASE=tracker
MONGO_PORT=27017
```

### Start docker containers

```bash
docker-compose up -d
```

### Setup node

It's not need to because it runs on a docker. But if you want, you can run locally with this commands:

```bash
nvm use
```

Install all dependencies

```bash
npm install
```

### Commands

This `Turborepo` already containered in a docker, no need to run commands.
But if you want, you can change the next line in the _docker-compose.yml_ for any of the next:

```bash
# Will build all the app & packages with the supported `build` script.
command: "npm run dev"
```

#### Build

```bash
# Will build all the app & packages with the supported `build` script.
npm run build
```

#### Develop

```bash
# Will run the development server for all the app & packages with the supported `dev` script.
npm run dev
```

#### test

```bash
# Will launch a test suites for all the app & packages with the supported `test` script.
npm run test
```

### Monitorization

A docker instance runs kafka-ui which allows to monitorize the messages. To access only need to open this in the browser:

```
http://localhost:8080
```

### References

This `Turborepo` has some additional tools already set for you:

- [TypeScript](https://www.typescriptlang.org/) for static type-safety
- [NestJS](https://nestjs.com/) for docs about the used framework
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Docker](https://www.docker.com/) for containerization
- [Docker-compose](https://docs.docker.com/compose/) to setup infrastructure
