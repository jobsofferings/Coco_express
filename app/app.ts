import express = require('express');
import path = require('path');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
import mongoClient = require('./mongoClient/index');

const app: express.Application = express();
const port = 5000;

app.use(express.static(path.join(__dirname, 'upload')));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

const Schema = mongoose.Schema;
const articleSchema = new Schema({
  title: { type: String },
  text_md: { type: String },
  link: { type: Number },
  read: { type: Number },
});
const User = mongoose.model("article", articleSchema);

app.post("/article", (req, res) => {
  const { offset, limit, key } = req.body
  const where = {
    $or: [
      { title: { $regex: new RegExp(key, 'i') } }
    ]
  };
  const set = { _id: 0 };
  User.find(where, set, function (err: Error, results: any) {
    if (err) {
      res.status(500).json({
        result: 1,
        error_info: '请求失败!'
      })
    } else {
      const total = results.length
      User.find(where).skip(offset).limit(parseInt(limit)).exec(function (err: Error, data: any) {
        if (err) return res.status(500).json({
          result: 1,
          error_info: '服务器繁忙，请稍后重试！'
        })
        return res.status(200).json({
          result: 0,
          message: '请求成功',
          total,
          data,
        })
      })
    }
  });
})

app.post("/articleDetail", (req, res) => {
  const { id } = req.body
  const where = { id };
  const set = { _id: 0 };
  User.find(where, set, function (err: any, results: any) {
    if (err) {
      res.end('Error');
    } else {
      res.send(results[0])
    }
  });
})

app.listen(port, function () {
  console.info(`listening on port ${port}!`);
});

module.exports = app;
module.exports = mongoClient;