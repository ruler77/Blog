const router = require('koa-router')()
const article = require('../model/article')
const user = require('../model/user')
const pv = require('../model/pv')
const category = require('../model/category')
const log = require('../model/log')

router.prefix('/admin')

router.use('/', async (ctx, next) => {
    if (ctx.session.user == undefined || ctx.session.user.length<=0)
        return await ctx.render('login',{msg:'重新登录'})
    else
        await next();
})

router.get('/', async (ctx, next) => {
    await ctx.render('admin/index',{
        user:{username:ctx.session.user},
        lastLoginTime:await user.lastLoginTime(),
        pvTotal:await pv.getTotal(),
        articleCount: await article.getCount(),
        categoryCount: await category.getCount(),
    })
})

router.get('/pvx',async (ctx,next)=>{
    let pvs = await pv.getAll();
    let data = {}
    data.data = pvs
    data.start = pvs[0].time
    data.end = pvs[pvs.length-1].time  
    ctx.body = data
})

//文章管理
router.get('/article', async (ctx, next) => {
    let size = 5  //每页最多显示5篇博客
    let curNum = ctx.query.p ? ctx.query.p : 1//当前页码
    let start = (curNum - 1) * size 
    start = start>-1?start:0
    let _articleNum = await article.getCount() //文章总数
    await ctx.render('admin/article/index', {
        user: { username: ctx.session.user },
        curPageNum: curNum,
        articleList: await article.getPage(start,size),//文章列表      
        articleNum: _articleNum,                //文章总数
        pageNum: Math.ceil(_articleNum/size), //总的页数
        categorys: await category.getList(),
        hot:-1
    })
})

router.post('/article', async (ctx, next) => {
    let { hot, categoryid } = ctx.request.body
    console.log(hot, '...', categoryid);
    let size = 5  //每页最多显示5篇博客
    let curNum = ctx.query.p ? ctx.query.p : 1//当前页码
    let start = (curNum - 1) * size
    start = start > -1 ? start : 0
    let _articleNum = await article.getCount() //文章总数
    await ctx.render('admin/article/index', {
        user: { username: ctx.session.user },
        curPageNum: curNum,
        articleList: await article.getPage(start, size , categoryid , hot),//文章列表      
        articleNum: _articleNum,                //文章总数
        pageNum: Math.ceil(_articleNum / size), //总的页数
        categorys: await category.getList(),
        hot: -1
    })
})

router.get('/article/sethot', async (ctx, next) => {
    let {id,hot} = ctx.query
    let t = await article.setHot(id,hot)
    if(t>0){
        await log.add({
            time: new Date(),
            handle: '设置热门',
            ip: ctx.ip,
            user_id: ctx.session.id
        });
        ctx.body = {
            code:1,
            msg:'设置成功'
        }
    }else{
        ctx.body = {
            code:0,
            msg:'设置失败'
        }
    }
})

router.get('/article/edit', async (ctx, next) => {
    if (ctx.query.id==undefined)
        return await ctx.redirect('/admin/')
    await ctx.render('admin/article/edit', {
        user: { username: ctx.session.user },
        categorys: await category.getList(),
        art: await article.getArticleById(ctx.query.id),
        code: 2,
        flag: false
    })
})

router.post('/article/edit', async (ctx, next) => {
    let { id,category_id, title, content, hot } = ctx.request.body
    let art = {
        id: id,
        title: title,
        content: content,
        hot: hot ? 1 : 0,
        category_id: category_id,
        thumbnail: ctx.request.body.uploadUrl ? req.uploadUrl : null
    }
    let res = await article.edit(art)
    if (res) {
        res = 1
    } else
        res = 2
    await ctx.render('admin/article/edit', {
        user: { username: ctx.session.user },
        categorys: await category.getList(),
        art: await article.getArticleById(id),
        code: res,
        flag: true
    })
})

router.get('/article/del', async (ctx, next) => {
    let { id} = ctx.query
    let t = await article.del(id)
    if (t > 0) {
        await log.add({
            time: new Date(),
            handle: '删除文章',
            ip: ctx.ip,
            user_id: ctx.session.id
        });
        ctx.body = {
            code: 1,
            msg: '删除成功'
        }
    } else {
        ctx.body = {
            code: 0,
            msg: '删除失败'
        }
    }
})

router.get('/article/add', async (ctx, next) => {
    await ctx.render('admin/article/add', {
        user: { username: ctx.session.user },
        categorys :await category.getList(),
        code:2,
        flag:false
    })
})

router.post('/article/add', async (ctx, next) => {
    let { category_id, title, content, hot } = ctx.request.body
    let art = {
        title: title,
        content: content,
        hot: hot ? 1 : 0,
        category_id: category_id,
        thumbnail: ctx.request.body.uploadUrl ? req.uploadUrl : null
    }
    // console.log(art);
    let res = await article.add(art)
    if(res){
        res = 1
        await log.add({
            time: new Date(),
            handle: '添加文章',
            ip: ctx.ip,
            user_id: ctx.session.id
        });
    }else
        res = 2
    await ctx.render('admin/article/add', {
        user: { username: ctx.session.user },
        categorys: await category.getList(),
        code: res,
        flag:true
    })
})

//账号管理
router.get('/account', async (ctx, next) => {
    await ctx.render('admin/account/index', {
        user: { username: ctx.session.user },
    })
})

router.post('/account', async (ctx, next) => {
    let {password} = ctx.request.body
    let res = await user.updataUser(ctx.session.id,password)
    console.log(res);
    if (res.affectedRows > 0) {
        await log.add({
            time: new Date(),
            handle: ctx.session.user+'修改了密码',
            ip: ctx.ip,
            user_id: ctx.session.id
        });
        ctx.body = { code: 1, msg: '添加成功' }
    } else {
        ctx.body = { code: 0, msg: '添加失败' }
    }
})

//分类管理
router.get('/category', async (ctx, next) => {
    await ctx.render('admin/category/index', {
        user: { username: ctx.session.user },
        categorys: await category.getList()
    })
})

router.post('/category/add', async (ctx, next) => {
    let { name, count } = ctx.request.body
    let res = await category.add(name,count)
    if (res > 0) {
        await log.add({
            time: new Date(),
            handle: '添加分类',
            ip: ctx.ip,
            user_id: ctx.session.id
        });
        ctx.body = { code: 1, msg: '添加成功' }
    } else {
        ctx.body = { code: 0, msg: '添加失败' }
    }
})

router.get('/category/del', async (ctx, next) => {
    let { id } = ctx.query
    let res = await category.del(id)
    if (res > 0) {
        await log.add({
            time: new Date(),
            handle: '删除分类',
            ip: ctx.ip,
            user_id: ctx.session.id
        });
        ctx.body = { code: 1, msg: '删除成功' }
    } else {
        ctx.body = { code: 0, msg: '删除失败' }
    }
})

router.post('/category/setcount', async (ctx, next) => {
    let { count,id } = ctx.request.body
    let res = await category.setCount(id,count)
    if (res > 0) {
        await log.add({
            time: new Date(),
            handle: '修改分类count',
            ip: ctx.ip,
            user_id: ctx.session.id
        });
        ctx.body = { code: 1, msg: '修改count成功' }
    } else {
        ctx.body = { code: 0, msg: '修改count失败' }
    }
})

router.post('/category/setname', async (ctx, next) => {
    let { name, id } = ctx.request.body
    let res = await category.setName(id,name)
    if (res > 0) {
        await log.add({
            time: new Date(),
            handle: '修改分类name',
            ip: ctx.ip,
            user_id: ctx.session.id
        });
        ctx.body = { code: 1, msg: '修改name成功' }
    } else {
        ctx.body = { code: 0, msg: '修改name失败' }
    }
})

//日志管理
router.get('/log', async (ctx, next) => {
    let size = 10  //每页最多显示日志条数
    let curNum = ctx.query.p ? ctx.query.p : 1//当前页码
    let start = (curNum - 1) * size
    start = start > -1 ? start : 0
    let _logNum = await log.getCount() //日志总数
    await ctx.render('admin/log/index', {
        user: { username: ctx.session.user },
        curPageNum: curNum,
        logList: await log.getPage(start, size),//日志列表      
        logNum: _logNum,                //日志总数
        pageNum: Math.ceil(_logNum / size), //总的页数
    })
})
module.exports = router
