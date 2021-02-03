const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const session = require('koa-generic-session')
const redisStore = require('koa-redis')
const mysql = require('mysql')
const path = require('path')
const fs = require('fs')
const morgan = require('koa-morgan')
const koaBody = require('koa-body')({
  multipart: true,  // 允许上传多个文件
});

const index = require('./routes/index')
const users = require('./routes/users')
const admin = require('./routes/admin')
const { exception } = require('console')
const { REDIS_CONF } = require('./conf/conf')

// //测试mysql
// const article = require('./model/article')
// article.getList().then(list=>{
  
//   console.log(body.yearNum)
// })

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text'],
  multipart: true  //使用这个才能支持form-data数据
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'ejs'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

const ENV = process.env.NODE_ENV
if (ENV !== 'production') {
  //开发环境
  app.use(morgan('dev'))
} else {
  console.log("线上环境")
  //线上环境
  const logFileName = path.join(__dirname, 'logs', 'access.log')
  const writeStream = fs.createWriteStream(logFileName, {
    flags: 'a',
  })
  app.use(morgan('combined', {
    stream: writeStream
  }))
}

//session配置
app.keys = ['sd&sd-+A123'] //用于加密session,生成cookie
app.use(session({
  //配置cookie
  cookie: {
    path: '/',
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000
  },
  //配置redis
  store: redisStore({
    // all: '127.0.0.1:6379' //根据自身redis服务地址进行配置，最好使用统一配置类，此处为方便直接写死，不推荐
    all: REDIS_CONF.host+':'+REDIS_CONF.port
  })
}))

//错误页面处理
app.use(async (ctx, next) => {
  try{
    await next(); //先让请求正常满足，等请求完成后，判断是否错误
    if (parseInt(ctx.status) === 404) {
      await ctx.render('404')
    }
  }catch(e){
    let msg = '';
    if (ENV !== 'production') {
      //开发环境
      msg = e;
      console.log(e);
    } 
    await ctx.render('500', {
      errorMessage: msg
    })
  }
})


// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(admin.routes(), admin.allowedMethods())

// error-handling
app.on('error',async (err, ctx) => {
  console.error('server error ...........', err, ctx)
});

module.exports = app
