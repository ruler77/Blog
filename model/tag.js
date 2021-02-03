/**
 * 标签数据模型
 */
module.exports = class Tag extends require('./model') {
    /**
     * 获取标签列表
     */
    static getList() {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT id,name FROM blog.tag;'
            this.query(sql).then(results => {
                resolve(results)
            }).catch(err => {
                console.log(`获取标签列表失败：${err.message}`)
                reject(err)
            })
        }) 
    }

    /**
     * 获取标签列表及各标签文章数
     */
    static getListAndNum() {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT a.id, a.name, count(a.id) as count FROM blog.tag a join blog.article_tag b where a.id = b.tagid group by a.id;'
            this.query(sql).then(results => {
                resolve(results)
            }).catch(err => {
                console.log(`获取标签列表及各标签文章数失败：${err.message}`)
                reject(err)
            })
        })
    }
    
    /**
     * 获取指定文章的标签列表
     */
    static getListByArticleId(id) {
        return new Promise((resolve, reject) => {
            let sql = 'SELECT id,name FROM tag where tag.id in(select tagid from article_tag WHERE articleid = ?);'
            this.query(sql,id).then(results => {
                resolve(results)
            }).catch(err => {
                console.log(`获取指定文章的标签列表失败：${err.message}`)
                reject(err)
            })
        })
    }
}