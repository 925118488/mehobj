module.exports = {
    cookieSecret: ' 把你的cookie 秘钥放在这里',
    QQMail: {
        user: '925118488@qq.com ',
        password:'12345 '
    },
    mongo: {
        development: {
            connectionString:'mongodb://root:12345abc@localhost:27017/admin',
        },
        production: {
            connectionString:'mongodb://root:12345abc@localhost:27017/admin',
        }

    }
};
