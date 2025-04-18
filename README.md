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


### Technical Notes

This is a list of decisions made during this exercise:

1. NestJS recommends using what they call "microservices" for communication with other APIs or queues, and they have a dedicated option for Kafka. I opted for this solution. However, I later found that there is no option for end-to-end testing with this setup (the community has been requesting this for some time). Due to time constraints, I decided not to implement the end-to-end tests I had planned.

2. I used Kafka-native instead of the classic Kafka + Zookeeper setup, as it is easier to configure and more practical to maintain (though I'm not a DevOps expert, so I can't recommend it for production use).

3. The persistence of events and notifications is intentionally decoupled, using an internal queue. I did this for several reasons:
    
    3.1. It allows the method that reads and parses events to be quickly available for the next one, without waiting for the entire code sequence to finish (checking event type, creating notifications, etc.).
    
    3.2. If scaling across multiple Lambdas/services is needed, it can be replaced with another type of queue (like Kafka or RabbitMQ) to manage the load more efficiently (for example, many listeners for events and one for notifications).

    3.3. The repositories do not store data in memory (something I’ve noticed is common with DDD); they persist directly to the database. This is done primarily for faster execution, but mainly because it allows for scaling, as mentioned in the previous point.

4. The use of a .env file is solely for creating environment variables through Docker, not for reading with "dotenv" or similar tools (and, of course, it is not pushed to the repository). This practice is highly recommended (avoiding dotenv), particularly in cloud environments: it mitigates potential vulnerabilities and facilitates better management through tools like vaults, as well as permission management for cloud services.

5. I considered the possibility of reading Kafka directly with streams to analyze its viability. However, I found that it was not feasible with the KafkaJS library, so I set it aside.


### References

This `Turborepo` has some additional tools already set for you:

- [TypeScript](https://www.typescriptlang.org/) for static type-safety
- [NestJS](https://nestjs.com/) for docs about the used framework
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting
- [Docker](https://www.docker.com/) for containerization
- [Docker-compose](https://docs.docker.com/compose/) to setup infrastructure
