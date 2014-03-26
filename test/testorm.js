var orm = require("orm")
	,model_def=require("../model");
var models={};
orm.connect("mysql://root:0@localhost/pa_dev", function (err, db) {
	model_def(db,models);
	var monthsmy={
		year:2013,
		month:1,
		person_id:1,
		state:'SAVED'
	}
	var Monthsmy=models.Monthsmy;
	Monthsmy.create([monthsmy],function(err,items){
		if(err){
			console.info(err);
			return;
		}
		console.info(items[0]);
		Monthsmy.find({person_id:1}).remove(function(err){
			console.info("delete it");
		});
	})


});