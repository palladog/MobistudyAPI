var express = require('express');
var router = express.Router();
var Database = require('arangojs');
var db = new Database({ url:'http://127.0.0.1:8529'});

db.useDatabase('nodeArangoWebAppDB');
db.useBasicAuth('root','');

const taskCollection = db.collection('User');

router.get('/getAllStudies', function(req, res){
  taskCollection
  .all()
  .then(function(response) {
    console.log(`Retrieved documents.`, response._result);
    return res.status(200).json(response._result);
  })
  .catch(function(error) {
    console.error('Error getting document', error);
    return res.status(500).json(error);
  });
});
router.post('/postNewStudy', function (req, res) {
  console.log("↓↓↓↓ Add New Study ↓↓↓↓");
  var study = {
    "studyjson": req.body.userstudy,
    // _key: 'firstDocument',
    c: Date()
  };
  taskCollection
  .all()
  .then(function(response) {
  return taskCollection.save(study);
  })
  .catch(function(error) {
    console.error('Error getting document', error);
    return res.status(500).json(error);
  });
});
module.exports = router;
