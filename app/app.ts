import express = require('express');
import path = require('path');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
import { Article, FriendLink, Messages } from './mongoClient/Schame'
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


app.post("/article", (req, res) => {
  const { offset, limit, key } = req.body
  const where = {
    $or: [
      { title: { $regex: new RegExp(key, 'i') } }
    ]
  };
  const set = { _id: 0 };
  Article.find(where).countDocuments().then((total: number) => {
    Article.find(where, set).skip(offset).limit(parseInt(limit)).exec((err: Error, data: any) => {
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
  Article.find(where, set, {}, function (err: any, results: any) {
    if (err) {
      res.end('Error');
    } else {
      res.send(results[0])
    }
  });
})

app.post("/starArticles", (req, res) => {
  const { limit = 5 } = req.body
  const where = {};
  const set = { _id: 0 };
  Article.find(where, set, { limit, sort: [[['read', -1]]] }, function (err: any, results: any) {
    if (err) {
      res.end('Error');
    } else {
      res.send({ data: results })
    }
  });
})

app.post("/getFriendLink", (req, res) => {
  const where = {};
  const set = { _id: 0, timer: 0 };
  FriendLink.find(where, set, {}, function (err: any, results: any) {
    if (err) {
      res.end('Error');
    } else {
      res.send({ data: results })
    }
  });
})


app.post("/addMessage", (req, res) => {
  const { messageContent } = req.body
  // console.log(req.ip)
  // 后续只允许一个IP留言五次（可以考虑是否为阈值）
  if (!messageContent) {
    return res.json({
      flag: false,
      message: '系统错误!',
    })
  }
  const data = {
    messageContent,
    username: 'ip',
    time: new Date().getTime().toString()
  }
  Messages.create(data, (err: any, results: any) => {
    res.json({
      flag: !err,
      message: err ? '系统错误!' : '留言成功!',
    })
  })
})

app.use((error: Error, req: any, res: any, next: Function) => {
  res.json({
    ok: 0,
    error
  })
})

app.listen(port, function () {
  console.info(`listening on port ${port}!`);
});

module.exports = app;
module.exports = mongoClient;