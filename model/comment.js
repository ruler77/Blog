/**
 * 评论数据模型
 */
module.exports = class Category extends require('./model') {
    /**
     * 添加评论
     * @param {object} msg 评论对象
     */
    static add(msg) {
        return new Promise((resolve, reject) => {
            let sql = 'INSERT INTO comment SET ?'
            this.query(sql, msg).then(results => {
                resolve(results)
            }).catch(err => {
                console.log(`添加评论失败：${err.message}`)
                reject(err)
            })
        })
    }

    /**
     * 获取评论列表
     * @param {Integer} start 开始序号
     * @param {Integer} size  限制返回个数
     */
    static getList(id, start, size) {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT * FROM blog.comment where article_id = ? ORDER BY id desc limit ? , ?'
            this.query(sql, [id, start, size]).then(results => {
                resolve(results)
            }).catch(err => {
                console.log(`获取评论列表失败：${err.message}`)
                reject(err)
            })
        })
    }
}