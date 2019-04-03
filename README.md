# MobistudyAPI

This is the back-end REST API of MobiStudy.

## Pre requisites

You need to install the following on your system:

- nodejs (v 10 or bigger)
- arango DB (v 3)

Install all other dependencies with `npm install`.


## Run it

The code is written using ES6 module, which are still experimental in nodejs.
To start it:

    node --experimental-modules .\bin\www.mjs

The first time you run it, you will probably need to set an admin user.
You can use the script called `createUser.mjs`, located in the same folder.

## Develop it

The code is written mostly in ES6 and uses ES6 modules, please be consistent.
