# How to add a new task to the system

These are some very preliminary notes about how to add a new task to the system.
Feel free to improve them!

As an example scenario, let's suppose we want to create a new task where participants
take their temperature with a Bluetooth sensor and send the temperature to the server.
Adding a new task means adding functionalities to the 3 modules of the system:
API, Web and App.


## API

First, it's good to let other people know what kind of data you want to send.
Create an example data type inside the folder "models", something like:

```
{
  "userKey":"asdasd",
  "studyKey":"asdasd",
  "taskId":2,
  "createdTS": "2019-02-27T12:46:07.294Z",
  "temperature": 36.3
}
```

Then you need to add support on the DB. Create a new file in src/DB to support saving
and searching of your temperatures:

```
export default async function (db, logger) {
  let collection = await utils.getCollection(db, 'temperatures')

  return {
    async getAllTemperatures () {
      var query = 'FOR temperature in temperatures RETURN temperature'
      applogger.trace('Querying "' + query + '"')
      let cursor = await db.query(query)
      return cursor.all()
    },

    async createTemperature (newtemperature) {
      let meta = await collection.save(newtemperature)
      newtemperature._key = meta._key
      return newtemperature
    },

    async deleteTemperature (_key) {
      await collection.remove(_key)
      return true
    }
  }
}
```
I am omitting the imports here for brevity.

This is the bare minimum, you may need more functions depending on the specific use cases.
Also, you need to add these functions to the DB object, check the DB.mjs file to see how.

Now you can create an endpoint where to save and retrieve these data. Add a file
in the "routes" folder.

```
export default async function () {
  var db = await getDB()

  router.get('/temperatures', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // some access control is needed here, check examples from other data types
      let temperatures = await db.getAllTemperatures()
      res.send(temperatures)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve temperatures')
      res.sendStatus(500)
    }
  })

  router.post('/temperatures', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newtemperature = req.body
    // skipping access control here
    newtemperature.userKey = req.user._key
    try {
      newtemperature = await db.createTemperatures(newtemperature)
      // also update task status
      let participant = await db.getParticipantByUserKey(req.user._key)
      if (!participant) return res.status(404)
      let study = participant.studies.find((s) => {
        return s.studyKey === newanswer.studyKey
      })
      if (!study) return res.status(400)
      let taskItem = study.taskItemsConsent.find(ti => ti.taskId === newtemperature.taskId)
      if (!taskItem) return res.status(400)
      taskItem.lastExecuted = newtemperature.createdTS
      // update the participant
      await db.replaceParticipant(participant._key, participant)
      res.send(newtemperature)

      applogger.info({ userKey: req.user._key, taskId: newtemperature.taskId, studyKey: newtemperature.studyKey }, 'Participant has sent new temperature')
      auditLogger.log('temperatureCreated', req.user._key, newtemperature.studyKey, newtemperature.taskId, 'Temperature created by participant with key ' + participant._key + ' for study with key ' + newtemperature.studyKey, { temperatureKey: newtemperature._key })
    } catch (err) {
      applogger.error({ error: err }, 'Cannot store new temperature')
      res.sendStatus(500)
    }
  })

  return router
}
```
This also needs to be added with the other routes, see app.mjs.


## Web

First, add the task configuration as an example in the models folder (in API project)
in the study_description. As an example:
```
{
  "id":4,
  "type":"dataQuery",
  "scheduling":{
    "startEvent":"consent",
    "startDelaySecs":1000,
    "untilSecs":100000000,
    "intervalType":"d",
    "interval":3,
    "months":[ ],
    "monthDays":[ ],
    "weekDays":[ ]
  },
  "dataType":"temperature",
  "allowManual": true,
}
```

Here I am assuming that the task has a flag that allows users to specify the temperature
manually if they want.

You need to add the possibility for the researcher to actually add that task description.
Check inside src/components/StudyDesignTasks.vue.
You can add a task definition, right where the other tasks are, as:

```
TBD
```

Remember that each task generates a consent item! Go and modify src/components/StudyDesignConsent.vue.
In "created()":

```
TBD
```

then in "generatePrivacy()":

```
TBD
```

As you can see, we also need some text to be added to the i18n objects, in this case:
`privacyPolicy.collectedDataTemperature` and `consent.taskItemTemperature`
which needs to have a correspondence in the translation files:

```
collectedDataTemperature: `\u2022 Body temperature.`,
...
taskItemTemperature: `I agree to provide my temperature, {scheduling}`
```

## app

You need to add a route, add pages and a Layout then manage the task from Tasker.
