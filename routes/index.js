const router = require('koa-router')()
const article = require('../model/article')
const category = require('../model/category')
const tag = require('../model/tag')
const message = require('../model/message')
const UUID = require("uuidjs")
const comment = require('../model/comment')

router.get('/', async (ctx, next) => {
  let body = {};
  body.articleList = await article.getList();
  body.articleNum = await article.getCount();
  body.hots = await article.getHot(5);
  body.types = await category.getList();
  body.tags = await tag.getList();
  await ctx.render('index', body) 
  await ctx.render('index', body) 
})

router.get('/index', async (ctx, next) => {
  let body = {};
  body.articleList = await article.getList();
  body.articleNum = await article.getCount();
  body.hots = await article.getHot(5);
  body.types = await category.getList();
  body.tags = await tag.getList();
  await ctx.render('index', body) 
})

router.get('/search', async (ctx, next) => {
  let body = {};
  body.keywords = ctx.request.query.keywords;
  body.articleList = await article.getListBykeywrod(body.keywords);
  body.articleNum = Object.keys(body.articleList).length;
  body.hots = await article.getHot(5);
  body.types = await category.getList();
  body.tags = await tag.getList();
  // article.getListBykeywrod(body.keywords).then(data => {
  //   body.articleList = data;
  //   body.articleNum = Object.keys(data).length
  // })
  // article.getHot(5).then(data => {
  //   body.hots = data;
  // })
  // category.getList().then(data => {
  //   body.types = data;
  // })
  // tag.getList().then(list => {
  //   body.tags = list;
  // })
  await ctx.render('search', body)
})

router.get('/login', async (ctx, next) => {
  await ctx.render('login',{msg:''})
})

router.get('/tags', async (ctx, next) => {
  let body={};
  body.tags = await tag.getListAndNum()
  body.curName = body.tags[0].name
  body.num = Object.keys(body.tags).length
  body.articleList = await article.getListByTagId(body.tags[0].id)
  await ctx.render('tags',body)
})

router.get('/tags/:id', async (ctx, next) => {
  let body = {};
  body.curName = "";
  body.tags = await tag.getListAndNum()
  body.tags.forEach(e => {
    if(e.id==ctx.params.id)
      body.curName = e.name;
  });
  body.num = Object.keys(body.tags).length
  body.articleList = await article.getListByTagId(ctx.params.id)
  await ctx.render('tags', body)
})

router.get('/types', async (ctx, next) => {
  let body = {};
  body.types = await category.getCategoryAndArticleCount();
  body.num = Object.keys(body.types).length;
  body.cur = body.types[0].id;
  body.articleList = await article.getListByCategoryId(body.cur);
  await ctx.render('types',body)
})

router.get('/types/:id', async (ctx, next) => {
  let body = {};
  body.types = await category.getCategoryAndArticleCount();
  body.num = Object.keys(body.types).length;
  body.cur = ctx.params.id
  body.articleList = await article.getListByCategoryId(body.cur);
  await ctx.render('types', body)
})

router.get('/content', async (ctx, next) => {
  await ctx.render('content')
})

router.get('/blog/:id', async (ctx, next) => {
  let body = {};
  body.article = await article.getArticleById(ctx.params.id)
  body.tags = await tag.getListByArticleId(ctx.params.id)
  body.comments = await comment.getList(ctx.params.id,0,10)
  if (body.article === undefined )
    return ;
  await ctx.render('blog',body)
})

router.get('/archives', async (ctx, next) => {
  let body = {}
  body.yearNum = 0;
  body.num = 0;
  body.list = {};
  await article.getListWithoutContent().then(list=>{
      list.forEach(e => {
        body.num++;
        if (body.list[e.time.getFullYear()] == undefined) {
          body.list[e.time.getFullYear()] = [e]
          body.yearNum++;
        }
        else {
          body.list[e.time.getFullYear()].push(e)
        }
      });
  })
  await ctx.render('archives',body)
})

router.get('/about', async (ctx, next) => {
  await ctx.render('about')
})

router.get('/message', async (ctx, next) => {
  let msgs = await message.getList(0, 10)
  await ctx.render('message',{msgs:msgs})
})

router.post('/comment',async (ctx,next)=>{
  let body = ctx.request.body
  body.time = new Date()
  body.ip = ctx.ip
  let res = await comment.add(body) 
  let code = 0
  if (res.affectedRows > 0)
    code = 1
  ctx.body = {
    code: code
  }
})

router.post('/message', async (ctx, next) => {
  let t = ctx.request.body
  let msg = {
    nickname:t.nickname,
    content: t.content,
    email:t.email,
    avatar:t.url,
    ip:ctx.ip,
    datetime:new Date()
  }
  let res = await message.add(msg)
  let code = 0
  if (res.affectedRows>0)
    code = 1
  ctx.body = {
    code:code
  }
})


router.get('/list', async (ctx, next) => {
  //从request中获取GET请求
  let request = ctx.query;
  await ctx.render('index', {
    name: 'Hi this is a list',
    body: ctx.querystring
  })
})

router.get('/string', async (ctx, next) => {
  ctx.body = 'koa2 string'
}) 

router.get('/json', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

router.get('/test/:id', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 id' + ctx.params.id,
    uuid:UUID.genV4().hexString
  }
})

module.exports = router
