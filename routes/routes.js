var monthplan=require("./monthplan.js")
	,wechart=require("./wechat.js")
	,paauth=require("./paauth.js")
	,mppage=require("./mp/mppage.js")
	,mpservice=require("./mp/mpservice.js");

exports.bind=function(app){
	app.get("/t.html",function(req,res){
		res.render("t");
	});
	app.get("/msg",function(req,res){
		res.render("common/msg");
	});
	monthplan.bind(app);
	wechart.bind(app);
	paauth.bind(app);
	mppage.bind(app);
	mpservice.bind(app);
}
