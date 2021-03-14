import express = require('express');
import path = require('path');
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
import session = require("express-session");
import { graphqlHTTP } from 'express-graphql';

var graphqlIndex = require('./graphql/index');

const app: express.Application = express();
const port = 4397;

app.use(express.static(path.join(__dirname, 'upload')));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/graphql', graphqlHTTP({ schema: graphqlIndex, pretty: true }))

app.use(session({
  secret: 'sessionKey',   // 可以随便写。 一个 String 类型的字符串，作为服务器端生成 session 的签名
  name: 'token',
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 //设置过期时间比如是一天，只要游览页面，一天没有操作的话再过期
  },
  rolling: true,
}))

/**
 * 404捕捉
 **/
app.use(function (req: any, res, next) {
  const { userInfo } = req.session;
  if (req.url !== '/loginApi' && req.url !== '/signApi') {
    if (!userInfo) {
      res.send({ status: 403, msg: '登录已过期,请重新登录' });
    } else {
      next();
    }
  } else {
    next();
  }
});

app.listen(port, function () {
  console.log(`listening on port ${port}!`);
});

module.exports = app;