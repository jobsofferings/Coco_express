import express = require('express');
import path = require('path');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
import mongoClient = require('./mongoClient/index');

const app: express.Application = express();
const port = 4397;

app.use(express.static(path.join(__dirname, 'upload')));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

var Schema = mongoose.Schema;
var articleSchema = new Schema({
  title: { type: String },
  text_md: { type: String },
  link: { type: Number },
  read: { type: Number },
});
var User = mongoose.model("article", articleSchema);

app.post("/article", (req, res) => {
  const { offset, limit } = req.body
  User.find({}, function (err: any, results: any) {
    console.log(results);
    if (err) {
      res.end('Error');
    } else {
      res.send(results)
    }
  });
})

app.listen(port, function () {
  console.info(`listening on port ${port}!`);
});

module.exports = app;
module.exports = mongoClient;