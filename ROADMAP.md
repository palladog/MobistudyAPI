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

- Docker image for the server
- migrate to quasar 1.0.0
- adopt [simple JSON notation](https://github.com/mpnally/Terrifically-Simple-JSON), get rid of `_key`
- automated tests
- forms can be drafted and kept local to the research team
- invite-only studies
- internationalisation
- use encrypted db on the app
- new activities like 6MWT
- migrate from moment to [Luxon](https://github.com/moment/luxon)
- external integrations through a well-defined API (?)


## Version 1.0.x (LAUNCH)

Includes major changes like:

- researchers added to studies (1 group per study)
- test studies
- audit log should not store results from tasks, just a link to where the data is
- add pictures and markdown text in questions and some fields
- educational content, with markdown, pictures and links
- new activities like snap a picture, propose educational content
- have data collected in separate DB for each study, each study DB can be remote
- patient's timeline (can use the audit log)
- independent security audit
- export data in CSV for researchers


## Version 1.1.x (SPAGHETTI)

Further cool staff:

- booking of appointments like with [GPs](https://developer.nhs.uk/gp-connect-specification-versions/) or with [commercial software](https://www.scheduleonce.com/integrations)
- generalised scoring for forms/questionnaires (a function that generates an array of scores + their names)
- anonymised export of data
