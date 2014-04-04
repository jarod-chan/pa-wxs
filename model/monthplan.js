var util = require("util")
	,help=require('./monthplan_help');

exports.bind=function (db,models){

	//月计划父类,原系统父类
	models.Fmp=db.define("idrtaskbill",{
		id:Number
	});
	
	//月计划
	models.Monthplan=db.define("idrmonthplanbill",{
		id:Number,
		year:Number,
		month:Number,
		department_id:Number,
		state:['NEW','SAVED','SUBMITTED','EXECUTE','FINISHED'] //NEW-"新建" SAVED-"暂存" SUBMITTED-"已提交" EXECUTE-"执行中" FINISHED-"已完成"
	},{
        methods: {
            get_state: help.get_state,
            get_fmt: help.get_fmt
        }
    });
	models.Monthplan.hasOne("department",models.Department,{autoFetch : true});//多对一，自动加载


	//月计划明细
	models.MPitem=db.define("idrtask",{ 
		id:Number,
		idrtaskbill_id:Number,
		sn:Number,
		context:String,
		summary:String
	});


}

