/**
 * 留言数据模型
 */
module.exports = class Category extends require('./model') {
    /**
     * 添加留言
     * @param {object} msg 留言对象
     */
    static add(msg) {
        return new Promise((resolve, reject) => {
            let sql = 'INSERT INTO message SET ?'
            this.query(sql,msg).then(results => {
                resolve(results)
            }).catch(err => {
                console.log(`添加留言失败：${err.message}`)
                reject(err)
            })
        })
    }

    /**
     * 获取留言列表
     * @param {Integer} start 开始序号
     * @param {Integer} size  限制返回个数
     */
    static getList(start,size){
        return new Promise((resolve,reject)=>{
            let sql = 'SELECT * FROM blog.message ORDER BY id desc limit ? , ?'
            this.query(sql,[start,size]).then(results=>{
                resolve(results)
            }).catch(err => {
                console.log(`获取留言列表失败：${err.message}`)
                reject(err)
            })
        })
    }
}