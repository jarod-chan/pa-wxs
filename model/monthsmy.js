var util = require("util")
	,help = require("./monthsmy_help");
//员工月度小结

exports.bind=function(db,models){
	//主表
	models.Monthsmy = db.define("monthchk", {
		id: Number,
		year: Number,
		month: Number,
		person_id:Number,
		state:['NEW','SAVED','SUBMITTED','FINISHED']
	},{
        methods: {
            get_state: help.get_state,
            get_fmt : help.get_fmt
        }
    });
    models.Monthsmy.hasOne("person",models.Person,{autoFetch : true});//多对一，自动加载
	//从表
	models.Msitem=db.define("monthchkitem",{
		id: Number,
		monthchk_id: Number,
		worktype_id: Number,
		sn: Number,
		task:String,
		workhour:Number,//浮点数
		point:Number
	});
	models.Msitem.hasOne("worktype",models.Worktype,{autoFetch : true});//多对一，自动加载
	//从表工作性质
	models.Worktype=db.define('worktype',{
		id:Number,
		sn:Number,
		worktype:String
	});
}