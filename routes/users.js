const router = require('koa-router')()
const user = require('../model/user')
const log = require('../model/log')

router.prefix('/user')

router.get('/', function (ctx, next) {
  ctx.body = 'this is a users response!'
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

router.post('/login',async function(ctx,next){
  //从登录请求中获取登录参数
  let {username,password} = ctx.request.body
  //从数据库中查询是否有该用户
  let res = await user.login(username,password)
  if(res==undefined)//查询失败
    //将请求交给login.ejs,并提供数据{errnum:-1,msg:'用户名密码不匹配'}给ejs模板引擎渲染
    return await ctx.render('login',{errnum:-1,msg:'用户名密码不匹配'})
  //登录成功，将用户名和id存入session
  ctx.session.user = username
  ctx.session.id = res.id
  //后台记录登录日志
  await log.add({
    time:new Date(),
    handle:'登录',
    ip:ctx.ip,
    user_id: ctx.session.id
  });
  //登录成功，后台重定向到后台管理路由
  await ctx.redirect('/admin/')
})

router.get('/logout',async function (ctx, next) {
  delete ctx.session.user;
  await log.add({
    time: new Date(),
    handle: '退出',
    ip: ctx.ip,
    user_id: ctx.session.id
  });
  await ctx.render('login', { errnum: 0, msg: '成功退出！！！' })
})

module.exports = router
