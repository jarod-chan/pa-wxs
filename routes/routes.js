var monthplan=require("./monthplan.js")
	,wechart=require("./wechat.js")
	,pa_auth=require("./pa_auth.js")
	,mp=require("./mp.js");

exports.bind=function(app){
	app.get("/t.html",function(req,res){
		res.render("t");
	});
	app.get("/msg",function(req,res){
		res.render("common/msg");
	});
	monthplan.bind(app);
	wechart.bind(app);
	pa_auth.bind(app);
	mp.bind(app);
}
