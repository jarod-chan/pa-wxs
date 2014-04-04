var monthplan=require("./monthplan.js")
	,paauth=require("./auth/paauth.js")
	,mppage=require("./mp/mppage.js")
	,mpservice=require("./mp/mpservice.js");//采用index.js代替更好？

exports.bind=function(app){
	app.get("/t.html",function(req,res){
		res.render("t");
	});
	app.get("/msg",function(req,res){
		res.render("common/msg");
	});
	monthplan.bind(app);
	paauth.bind(app);
	mppage.bind(app);
	mpservice.bind(app);
}
