const MongoClient = require('mongoose');

const db = MongoClient.connection;
const connectAddress = 'mongodb://134.175.103.75:27017/coco';
const connectProps = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true,
  authSource: "admin",
  auth: {
    user: 'coco',
    password: 'ithinkso123!',
  }
}

MongoClient.connect(connectAddress, connectProps, function (err: any, db: any) {
  console.log(`数据库：${db.connections[0].name} 成功连接`)
});

db.on('open', function () {
  console.info('Mongo 开启成功,等待连接')
})

db.on('error', function () {
  console.info('Mongo 开启失败');
})

export default db;
