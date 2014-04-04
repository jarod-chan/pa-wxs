	
	var express = require('express')
	  , flash = require('connect-flash')
	  , http = require('http')
	  , path = require('path')
	  , orm = require("orm")
	  , model_def = require('./model')
	  , routers_def = require('./routes')
	  , cache_pa = require('./infrastructure/cache');

	var app = express();

	// all environments
	app.set('json spaces',0);//返回的json格式
	app.set('port', process.env.PORT || 3000);
	app.set('views', __dirname + '/views');
	var ejs = require('ejs');
	app.engine('.html', ejs.__express);
	app.set('view engine', 'html');
	app.use(express.favicon());
	app.use(express.logger('dev'));
	app.use(express.urlencoded());
	app.use(express.json());
	app.use(express.methodOverride());
	app.use(express.cookieParser('secret'));
	app.use(express.session({key: 'sid'}));
	app.use(flash());//flash 返回的是个数组
	app.use('/static',express.static(path.join(__dirname, 'public')));

	app.use(cache_pa());
	//304缓存处理，静态资源缓存，但是页面不缓存
	app.use(function(req, res, next) {
	  req.headers['if-none-match'] = 'no-match-for-this';
	  next();    
	});
	//数据库模型定义
	app.use(orm.express("mysql://root:0@localhost/pa_dev?debug=true&pool=true", {
	    define: function (db, models, next) {
	    	db.settings.set('instance.cache', false);
	        model_def(db,models);
	        next();
	    }
	}));

	//this project namespace
	app.use(function(req,res,next){
		req.pa=req.pa||{};
		next();
	});
	app.use(app.router);



	// 只用于开发环境
	if ('development' == app.get('env')) {
		app.use(express.errorHandler({
			dumpExceptions: true,
			showStack: true
	    }));
	}

	// 只用于生产环境
	if ('production' == app.get('env')) {
	    app.use(express.errorHandler());
	}

	//绑定路由控制
	routers_def(app);

	http.createServer(app).listen(app.get('port'), function(){
		console.log('pa-wxs '+app.get('env')+' server listening on port ' + app.get('port'));
	});
