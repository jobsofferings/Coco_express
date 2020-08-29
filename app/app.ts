import express = require('express');
import loginRouter from './router/login';
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
import { responseProps } from './functions/types';
const session = require("express-session");
const path = require('path');

const app: express.Application = express();
const port = 4397;

app.use(express.static(path.join(__dirname, 'upload')));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/', loginRouter.login);

/**
 * node错误捕捉 （不知道算不算，可以日后将错误存入日志） 
 * node持久token
 * 数据库相关
 **/

/**
 * session
 **/
app.use(session({
  secret: 'sessionKey',   // 可以随便写。 一个 String 类型的字符串，作为服务器端生成 session 的签名
  name: 'token',
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 //设置过期时间比如是一天，只要游览页面，一天没有操作的话再过期
  },
  rolling: true,
  // resave: false,   /*强制保存 session 即使它并没有变化,。默认为 true。建议设置成 false。*/
  // saveUninitialized: true,   //强制将未初始化的 session 存储。  默认值是true  建议设置成true
  // cookie: {
  //   maxAge: 5000    /*过期时间*/
  // },   /*secure https这样的情况才可以访问cookie*/
  // rolling: true, //在每次请求时强行设置 cookie，这将重置 cookie 过期时间（默认：false）
  // proxy: true,// 对于cookie使用secure后,在传递的过程中相信反向代理服务器,默认为undefined只相信正向代理
  // unset: 'keep'// 控制没有设置`req.session`时候的行为(使用delete删除或者赋值null),默认'keep'会话期间不会保留,'destroy'会话完成后删除.
}))

if (app.get('env') === 'development') {
  app.use(function (err: any, req: any, res: any, next: any) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

/**
 * 404捕捉
 **/
app.use(function (req: any, res, next) {
  /**
   * 这个位置日后可以用来对各请求进行权限检查（记得除注册登录请求）
   **/
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

/**
 * 登录
 **/
app.post('/loginApi', (req: any, res) => {

  const { username, password } = req.body;
  const resSend: responseProps = { flag: false, message: '' };
  if (username && password) {
    const isUser = username === 'jobs' && password === '123456'; // 这个可以放数据库
    if (isUser) {
      resSend.flag = true;
      resSend.message = '登录成功!';
      req.session.userInfo = { username, password };
    } else {
      resSend.message = '用户名或密码错误!';
      req.session.destroy();
    }
  } else {
    resSend.message = '请输入合法的用户名或密码!';
  }
  res.send(resSend);
})

/**
 * 测试cookie
 **/
app.post('/testApi', (req: any, res) => {
  const resSend: any = { flag: false };
  // console.log(req);
  res.send(resSend);
})

// app.use(function (err: any, req: any, res: any, next: any) {
//   console.log("Error happens", err);
//   // 这里做一个函数写入文件并准备回调
//   next();
// });

app.listen(port, function () {
  console.log(`listening on port ${port}!`);
});

module.exports = app;