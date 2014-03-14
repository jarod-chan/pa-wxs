var util = require("util");

exports.bind=function (db,models){
	
	//人员
	models.Person =db.define("fyperson", {
		id: Number,
		name: String,
		email: String,
		chkstr:String,
		manage:['A','G','Y','N'], // A-管理员 G-分管副总 Y-部门经理 N-普通员工
		department:String,
		state:['valid','invalid','leave'] //valid-有效 invalid-返聘  leave-离职
	});
	
	//部门
	models.Department=db.define("department",{
		id:Number,
		name:String,
		number:String,
		gmange_id:Number
	});

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
            getState: function () {
               var state_map={
					NEW:'新建',
					SAVED:'暂存',
					SUBMITTED:'已提交',
					EXECUTE:'执行中',
					FINISHED:'已完成'
               }
               return state_map[this.state];
            },
            get_fmt:function(){
            	var info=util.format('%s年%s月%s工作执行情况',this.year,this.month,this.department.name); 
            	return {
            		id:this.id,
            		fullname:info,
            		state:this.getState()
            	}
            }
        }
    });
	models.Monthplan.hasOne("department",models.Department,{autoFetch : true});//多对一，自动加载


	//月计划明细
	models.MPitem=db.define("idrtask",{ 
		id:Number,
		idrtaskbill_id:Number,
		sn:Number,
		context:String,
		summary:String,
	});
}

