Mobistudy roadmap
=================

Roadmap for the whole project, includes API, Web and App

## Version 0.1.x (MVC)

This is the MVC version of Mobistudy, it includes:

- [X] create study
- [X] informed consent
- [X] forms, data query
- [X] create and manage users, teams, participants
- [X] security and access control


## Version 0.2.x (BETA)

It will include some improvements to version 0.1.x:

- [X] Docker image for the server
- [X] migrate to quasar 1.0.0
- [ ] automated tests
- [ ] internationalisation
- [ ] adopt [simple JSON notation](https://github.com/mpnally/Terrifically-Simple-JSON), get rid of `_key`
- [ ] invite-only studies
- [ ] use encrypted db on the app
- [ ] 6MWT task
- [ ] step test task
- [ ] data from wearable(s) task
- [ ] migrate from moment to [Luxon](https://github.com/moment/luxon)

## Version 1.0.x (LAUNCH)

Includes major changes like:

- [ ] forms can be drafted and be made public
- [ ] external integrations through a well-defined API (?)
- [ ] test studies
- [ ] audit log should not store results from tasks, just a link to where the data is
- [ ] add pictures and markdown text in questions and some fields
- [ ] educational content, with markdown, pictures and links
- [ ] new activities like snap a picture, propose educational content
- [ ] have data collected in separate DB for each study, each study DB can be remote
- [ ] patient's timeline (can use the audit log ?)
- [ ] independent security audit
- [ ] export data in CSV for researchers


## Version 1.1.x (SPAGHETTI)

Further cool staff:

- marketplace where to sell/buy extra components
- booking of appointments like with [GPs](https://developer.nhs.uk/gp-connect-specification-versions/) or with [commercial software](https://www.scheduleonce.com/integrations)
- generalised scoring for forms/questionnaires (a function that generates an array of scores + their names)
- anonymised export of data
