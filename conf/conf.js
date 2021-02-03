const env = process.env.NODE_ENV  // 环境参数

// 配置
let MYSQL_CONF
let REDIS_CONF

//开发环境配置
if (env === 'dev') { 
    // mysql
    MYSQL_CONF = {
        host: 'localhost',
        user: 'admin_test',
        password: '123456',
        port: '3306',
        database: 'blog'
    }

    // redis
    REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    }
}

//上线配置（生产环境配置）
if (env === 'production') {
    // mysql
    MYSQL_CONF = {
        host: 'localhost',
        user: 'admin_test',
        password: '123456',
        port: '3306',
        database: 'blog'
    }

    // redis
    REDIS_CONF = {
        port: 6379,
        host: '127.0.0.1'
    }
}

module.exports = {
    MYSQL_CONF,
    REDIS_CONF
}