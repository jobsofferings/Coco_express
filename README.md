### node 实现登录状态持久化

&emsp;&emsp;众所周知，TCP协议是一个无状态的协议，所以我们的登录如果没有特殊操作的话，会造成每次请求都需要携带登录信息，并在数据库中进行一次不必要的user查询操作。

&emsp;&emsp;所以要实现每次请求，或者刷新界面，我们的网页都是在登录态，而不用重新登录，我们应该怎么去设计我们的后端呢？我们可以使用token来当作一个登录的key保存在`cookie`中，然后再后端维护一个`session`，每次都使用这个token来进行鉴权。

我制作了一个简单的流程图如下：
![流程图1](https://images.cnblogs.com/cnblogs_com/JobsOfferings/1363202/o_2007140931111.jpg)
![流程图2](https://images.cnblogs.com/cnblogs_com/JobsOfferings/1363202/o_2007140931162.jpg)

具体的流程为：

1. 用户输入用户名username、密码password。
2. 若登录失败（数据库请求user信息），返回登录失败信息，不设置`cookie`。
3. 若登录成功，后端维护一个`session`，其中带有token信息，设置有效期，将对应的token信息设置为`cookie`，返回登录成功信息。
4. 当用户进行其他请求的时候，`cookie`会自动带在请求头中，取这个`cookie`中的token信息
5. 若`session`中有对应的token，且未过期，则登录成功，调用next()进行接下来的操作，如果过期或没有对应`session`，返回错误信息，重新登录，前端重定向到登录界面等待用户重新登录。

&emsp;&emsp;可以看到，即使是比较基础的`session-token`也是相对较难的操作，不过搞清楚了基本原理，我们就可以按自己的想法进行开发，比如这个`session`可以用`Map()`或者`Array`代替，封装一些设置、读取cookie的共用方法等等。

&emsp;&emsp;或者我们这里可以使用一些已开发的库，加快我们的开发速度，也能兼顾一些我们没有注意到的点。这里我们选择`express-session`作为设置`session`的库，还有一些其他的库。这里默认大家已经搭好了基本的express+node环境，这里我们来安装一下必须的库（这里不教大家的原因是博主使用了`TS-node`，搭建方式可能不一样，而这块其实与TS关系不太大，所以博主省略了TS操作以及types库下载）。

```
npm install express-session body-parser cookie-parser --save
```

&emsp;&emsp;我们来看看各区域的结构与基本作用，文章的末尾有这个文件的完整代码。

```ts
import express = require('express');
import { RequestHandler } from 'express';
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
const session = require("express-session");
const path = require('path');
```

&emsp;&emsp;这是`app.js`的头部，导入了一些必备的库文件，如果是正式开发应该还会有一些数据库的操作封装或者路由，这边是为同学们搭建了一个简单易用的示例，主要希望大家能够理解node关于实现登录状态持久化的操作。

```ts
/**
 * 只做一个express实例
 **/
const app = express();
// 端口
const port = 4397;

// 设置express静态文件夹，与此文章关系不大
app.use(express.static(path.join(__dirname, 'upload')));
// 使用body-parser对request内的数据进行一个format，使得我们易于获取数据
app.use(bodyParser.json());
// 这个cookie-parser库，方便操作客户端中的cookie值
app.use(cookieParser());
// urlencoded用来解析request中body的urlencoded字符，只支持utf-8的编码的字符
app.use(bodyParser.urlencoded({ extended: false }));

```

&emsp;&emsp;以上是`express`的一些必备的配置项，有的可以方便我们的操作，有的可以对传输的数据做一些初始化。

```ts
/**
 * session配置
 **/
app.use(session({
  secret: 'sessionKey', // 可以随便写。String类型的字符串，作为服务器端生成 session 的签名
  name: 'token', // 这个会作为给cookie设置值的key
  saveUninitialized: true, // 强制将未初始化的 session 存储。默认值是true，建议设置成true
  resave: false, // 强制保存 session 即使它并没有变化,。默认为 true。建议设置成 false。
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 //设置过期时间是一天
  },
  rolling: true, // 在每次请求时强行设置 cookie，这将重置 cookie 过期时间，默认：false
}))
```

&emsp;&emsp;这是关于`session`的一些配置，是`express-session`给我们暴露的内部的API，使用之后可以在这一个`express`实例中使用以下配置，部分配置可以根据大家的喜好进行调整。

```ts
app.use(function (req: any, res, next) {
  const { userInfo } = req.session;
  if (req.url !== '/loginApi' && req.url !== '/signApi') {
    if (!userInfo) {
      res.send({ flag: false, status: 403, msg: '登录已过期,请重新登录' });
    } else {
      next();
    }
  } else {
    next();
  }
});
```

&emsp;&emsp;以上是一个关于请求的类似全局过滤器的东西，你可以在这里取到`request`的所有信息并对其进行过滤，如method、data、cookies。代码中的next()函数代表“放过这一层筛选”的意思，举个例子如果你有一个关于`/getAllUser`的接口，用户请求这个接口时，会先经过这个筛选器。里面的逻辑是你自己写的，可以根据你的业务逻辑，来控制这个请求是否直接使用`res.send`直接返回`response`，或者让其成功请求`/getAllUser`接口。其中`req.session`里面有`express-session`已经帮我们处理好的`session`数据，我们可以在登录成功的时候在内部置入数据，如果存在这个数据（存在的话也能代表该`session`未过期）则代表已经登录成功了。

```ts
/**
 * 登录
 **/
app.post('/loginApi', (req, res) => {
  const { username, password } = req.body;
  const resSend = { flag: false, message: '' };
  if (username && password) {
    const isUser = username === 'jobs' && password === '123456'; 
    // 这个可以放数据库，此处只为演示
    if (isUser) {
      resSend.flag = true;
      resSend.message = '登录成功!';
      // 这里还可以在查询数据库登录成功之后，存入_id之类的编号，方便查找
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
```

&emsp;&emsp;这是我们的登录操作，如果登录不成功，返回登录失败信息，不为前端设置`cookie`，如果登录成功，将维护一个`session`，返回登录成功信息，并为前端设置`cookie`，以后的请求都将带上这个`cookie`（一般称为token，是一个不包含登录信息的值，对应服务端`session`，这样可以减少安全风险，`express-session`已封装好，不用自己处理相关逻辑）。我们来测试一下我们的token是否有效吧～

```ts
/**
 * 测试cookie
 **/
app.post('/testApi', (req, res) => {
  const resSend = { flag: true };
  res.send(resSend);
})
```

&emsp;&emsp;这是一个很简单的请求，前端访问这个接口后，会先经过筛选器的筛选，只有token对应的`session`存在，且未过期，才可以成功进入这个函数，所以我们可以在自己的浏览器的开发者工具中，查看对应的返回数据，如果返回的是

```
{ flag: false, status: 403, msg: '登录已过期,请重新登录' }
```

&emsp;&emsp;表示还没有设置成功，因为我们设置的是`cookie`一天到期，所以要么是没有进行登录，要么是某些地方的代码出现了差错。如果返回的是

```
{ flag: true }
```

&emsp;&emsp;代表`cookie`设置成功了，因为通过了筛选器`{ flag: true }`是该请求自身的返回逻辑，那么说明进行其他请求的时候，不用再请求一次用户登录操作，就可以一直保持登录态了，刷新界面的时候也不会因为不是登录态而跳转回登陆界面了。

&emsp;&emsp;其实这是最基础的token的流程逻辑，更复杂的系统可能还会维护一个很长很长的token，频繁请求的时候不更新短token的有效期，这样如果短token过期，就可以使用长token进行鉴权，成功的话重新生成一个新的短token，这样可以减少一部分的`session`数据改变成本，这些可以根据大家的实际业务逻辑进行自己的修改，可以先行体验一下这种方法的使用方法和友好程度，大家记得用代码自己实现一下，可以加深下印象，下面是`app.js`整体的代码，相关其他的业务方面的已经删除，有助于大家详细的了解关于`session`的部分～

```ts
import express = require('express');
import { RequestHandler } from 'express';
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
const session = require("express-session");
const path = require('path');

const app = express();
const port = 4397;

app.use(express.static(path.join(__dirname, 'upload')));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));

/**
 * session
 **/
app.use(session({
  secret: 'sessionKey',
  name: 'token',
  saveUninitialized: true,
  resave: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24
  },
  rolling: true,
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
app.post('/loginApi', (req, res) => {

  const { username, password } = req.body;
  const resSend = { flag: false, message: '' };
  if (username && password) {
    const isUser = (username === 'jobs' && password === '123456');
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
app.post('/testApi', (req, res) => {
  const resSend = { flag: false };
  res.send(resSend);
})

app.listen(port, function () {
  console.log(`listening on port ${port}!`);
});

module.exports = app;
```