Mobistudy roadmap
=================

Roadmap for the whole project, includes API, Web and App

## Version 0.1.x (MVC)

This is the MVC version of Mobistudy, it includes:

- create study
- informed consent
- forms, data query
- create and manage users, teams, participants
- security and access control


## Version 0.2.x (BETA)

It will include some improvements to version 0.1.x:

- migrate to quasar 1.0.0
- automated tests
- migrate from moment to [Luxon](https://github.com/moment/luxon)
- extra tasks should also have an id, or taskId should be removed altogether
- forms can be drafted and kept local to the research team
- add pictures and markdown text in questions and some fields
- Docker project for the server
- educational content, with markdown, pictures and links
- new activities like 6mwt, snap a picture, propose educational content
- use encrypted db on the app


## Version 1.0.x (LAUNCH)

Includes major changes like:

- internationalisation
- better abstraction for the database, get rid of `_key` and use `id` instead
- include Postgres as DB
- audit log should not store results from tasks, just a link to where the data is
- have data collected in separate DBs, also remote
- independent security audit
- patient's timeline (can use the audit log)
- export data in CSV


## Version 1.1.x (SPAGHETTI)

Further cool staff:

- booking of appointments like with [GPs](https://developer.nhs.uk/gp-connect-specification-versions/) or with [commercial software](https://www.scheduleonce.com/integrations)
- generalised scoring for forms/questionnaires (a function that generates an array of scores + their names)
- scalability
