# MobistudyAPI

This is the back-end REST API of MobiStudy.

## Pre requisites

You need to install the following on your system:

- nodejs (v 10 or bigger)
- arango DB (v 3)

Install all other dependencies with `npm install`.

On Arango, you must have created a dedicated database for Mobistudy, and, possibly,
also a dedicated user with its password.

## Run it

The code is written using ES6 module, which are still experimental in nodejs.
To start it:

    node --experimental-modules ./src/www.mjs

You also need to provide either a configuration file with the name config.json
inside the /config folder (see /config/config.template.json for an example) or
provide the same configuration as environment variables.

| Variable           | Type    | Default     | Secret |
|--------------------|---------|-------------|--------|
| WEB_PORT           | integer | 8080        | NO     |
| WEB_CLUSTER        | boolean | true        | NO     |
| LOGS_FOLDER        | string  | 'logs'      | NO     |
| LOGS_ROTATIONSIZE  | string  | '1M'        | NO     |
| LOGS_CONSOLE       | boolean | false       | NO     |
| LOGS_LEVEL         | integer | 30          | NO     |
| AUTH_SECRET        | string  | NA          | YES    |
| AUTH_TOKEN_EXPIRES | string  | '30 days'   | NO     |
| AUTH_ADMIN_EMAIL   | string  | NA          | YES    |
| AUTH_ADMIN_PASSWORD| string  | NA          | YES    |
| DB_HOST            | string  | 'localhost' | NO     |
| DB_PORT            | integer | 8529        | NO     |
| DB_NAME            | string  | NA          | YES    |
| DB_USER            | string  | NA          | YES    |
| DB_PASSWORD        | string  | NA          | YES    |
| GMAIL_EMAIL        | string  | NA          | YES    |
| GMAIL_CLIENTID     | string  | NA          | YES    |
| GMAIL_PROJECTID    | string  | NA          | YES    |
| GMAIL_SECRET       | string  | NA          | YES    |
| GMAIL_REFESHTOKEN  | string  | NA          | YES    |

AUTH_ADMIN_EMAIL and AUTH_ADMIN_PASSWORD are used at the first start, to generate
an admin user that can be used to access the website the first time.

## Test it

Run `npm run test:unit`. If you want to have the tests run continuously (as you
change the code), add ` -- --watch`.

## Develop it

The code is written mostly in ES6 and uses ES6 modules, please be consistent.

The folder structure is vaguely inspired by [this](https://softwareontheroad.com/ideal-nodejs-project-structure).
```
project
└───config        // contains the runtime configuration files
└───models        // examples of data managed by the app, in json
└───src           // application code
│   └───DB        // access to the database
│   └───i18n      // internationalised text
│   │   └───en    // English text
│   │   └───sv    // Swedish text
│   └───routes    // API endpoints
│   └───services  // application logic
│   └───services  // application logic
└───test          // automatic tests
│   └───jest      // unit tests
│   └───__tests__ // test specs
```

## Use Docker

Build the docker instance:

```
docker build -t mobistudyapi .
```

Then run it with:

```
docker run -d \
    -p 80:8080 \
    -v /local/path/to/logs:/usr/src/app/logs \
    -v /local/path/to/config:/usr/src/app/config \
    --name mobistudyapi
    mobistudyapi
```

Instead of leaving a config file on the server, for security reasons, you may
also consider using environmental.
Notice that the WEB_PORT environment variables should not be passed when using Docker,
it is fixed to 8080.

In a production environment, it is recommendable to use Docker secrets instead of
environment variables when possible. The variables that can be passed as Docker
secret are:
AUTH_SECRET, AUTH_ADMIN_EMAIL, AUTH_ADMIN_PASSWORD, DB_NAME, DB_USER, DB_PASSWORD,
GMAIL_CLIENTID, GMAIL_PROJECTID, GMAIL_SECRET, GMAIL_REFESHTOKEN


This also needs Arango to be running according to the specified configuration.
Check the [Wiki](https://github.com/Mobistudy/MobistudyAPI/wiki/Docker-setup)
for tips on how to setup a complete server instance with Docker.
