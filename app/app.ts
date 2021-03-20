import express = require('express');
import path = require('path');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
import mongoClient = require('./mongoClient/index');

const app: express.Application = express();
const port = 5000;
const ALLOW_ORIGIN_LIST = ['http://localhost:3000', 'http://www.jobsofferings.cn'];

app.all('*', function (req, res, next) {
  if (ALLOW_ORIGIN_LIST.includes(req.headers.origin || '')) {
    res.header('Access-Control-Allow-Origin', req.headers.origin); //当允许携带cookies此处的白名单不能写’*’
    res.header('Access-Control-Allow-Headers', 'content-type,Content-Length, Authorization,Origin,Accept,X-Requested-With'); //允许的请求头
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT'); //允许的请求方法
  }
  next();
});

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
  User.find(where, set).countDocuments().then((total: number) => {
    User.find(where).skip(offset).limit(parseInt(limit)).exec((err: Error, data: any) => {
      return res.status(200).json({
        result: 0,
        message: '请求成功',
        total,
        data,
      })
    })
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