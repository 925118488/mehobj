
//{{------引入相关依赖模块（库）部分
var express = require('express');



var path = require('path');
var favicon = require('serve-favicon');
var bodyParser = require('body-parser');

//var admin = require('./routes/admin');//express.Router();
var index = require('./routes/index');
var users = require('./routes/users');
var credentials = require('./crendtails');
//------引入相关依赖模块（库）部分}}


//{{---实例化（将相关依赖模块实例化）部分
var app = express();

//---实例化（将相关依赖模块实例化）部分}}


//{{---设置环境变量部分
app.set('port', process.env.PORT || 3008);

//---设置环境变量部分}}


//{{---调用中间件部分
// cookie-parser configuration
app.use(require('cookie-parser')(credentials.cookieSecret));

// express-session configuration
app.use(require('express-session')({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret,
}));


// database configuration MongoDB数据库连接设置
var mongoose = require('mongoose');
var options = {
    server: {
        socketOptions: { keepAlive: 1 }
    }
};
switch(app.get('env')){
    case 'development':
        mongoose.connect(credentials.mongo.development.connectionString, options);
        break;
    case 'production':
        mongoose.connect(credentials.mongo.production.connectionString, options);
        break;
    default:
        throw new Error('Unknown execution environment: ' + app.get('env'));
}



//设置handlebars 视图引擎及视图目录和视图文件扩展名
var handlebars = require('express-handlebars')
    .create({
        defaultLayout: 'main', // 设置默认布局为main
        extname: '.hbs', // 设置模板引擎文件后缀为.hbs
        //创建一个Handlebars 辅助函数，让它给出一个到静态资源的链接：
        helpers: {
            static: function(name) {
                return require('./lib/static.js').map(name);
            },
            section: function(name, options){
                if(!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });
app.engine('hbs', handlebars.engine);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));




app.use(express.static(__dirname + '/public'));
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//Handlebars中引用局部文件 中间件设置
app.use(function(req, res, next){
    if(!res.locals.partials)  res.locals.partials = {};
    res.locals.partials.discountContext = {
        locations: [{product: 'book', price: '99.00'}]
    };
    next();
});


app.use('/', index);
app.use('/users', users);
// 创建子域名 "admin" ……它应该出现在所有其他路由之前

var admin = express.Router();

var adminpp = express();
    adminpp.use(function (req, res, next) {
    var username = req.vhost[0] // username is the "*"

    // pretend request was for /{username}/* for file serving
    req.originalUrl = req.url
    req.url = '/' + username + req.url

    next()
});


// 创建admin 的路由；它们可以在任何地方定义
admin.get('/', function(req, res,next){
    res.type("text/html");
    res.status(200);
    res.send('admin/home');
});
admin.get('/users', function(req, res,next){
    res.send('admin/users');
});

//---调中间件部分}}


//默认路由
/*
app.get('/', function(req, res){
    res.redirect('./');
});
*/


//{{------定制错误部分

// 定制404 页面（所有的确404错误，都是找不到页面或
// 文件或路由错误---原因有两个，1、用户访问时在浏览
// 器中输入错误，2、开发者引用文件或路由错误）
app.use(function(req, res){
    res.type('text/html');
    res.status(404);
    res.send(' <span style="color:red">404 - Not Found</span>');
});

// 定制500 页面（所有的500错误都是服务器端代码错识）
app.use(function(err, req, res, next){
    console.error(err.stack);
    res.type('text/plain');
    res.status(500);
    res.send('500 - Server Error');
});
//-----定制错误部分}}


//在指定端口上启动应用
app.listen(app.get('port'), function(){
    console.log( 'Express 已启动在 http://localhost:' +
        app.get('port') + '; 若要终止运行请按组合键 Ctrl-C .' );
});