import jwt from 'jsonwebtoken'

const jwtKey = 'junkaicool' // token生成的密匙，根据自己需求定义

export const jwtSign = (data: any) => { // token生成函数，有效时间为一个小时
  const token = jwt.sign(data, jwtKey, { expiresIn: 60 * 60 })
  return token
}

export const jwtCheck = (req: any, res: any, next: any) => { // token验证函数
  const token = req.headers.token
  jwt.verify(token, jwtKey, (err: any, data: any) => {
    if (err) {
      res.send({
        code: '999999',
        msg: 'token无效'
      })
    } else {
      req.jwtInfo = data
      next()
    }
  })
}
