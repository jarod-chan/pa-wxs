var rt = require("../common/result.js")
	,msg=require("../common/msg.js")
	,bd_page=require("../common/page.js")
	,monthplan_service=require('../../service/monthplan_service')
	,util=require('util')
	,step=require('step');



exports.list=function(req,res){
	var person=req.pa.person;
	var page_numb=req.query.page_numb; 
	var page=bd_page(page_numb);
	
	var ctx={pa_id:person.id,msg:req.cache_pa.msg(),post:req.pa.person_post};
	step(
		function(){
			var Dept=req.models.Department;
			Dept.find({gmange_id:person.id}).run(this);
		},
		function(err,depts){
			var dept_ids=[];
			for (var i=0,len=depts.length;i<len;i++){
				dept_ids[i]=depts[i].id;
			}
			return dept_ids;
		},
		function(err,detp_ids){
			var Plan=req.models.Monthplan;
			Plan.find({or:[{state:'EXECUTE'}, {state:'FINISHED'}],department_id:detp_ids})
				.order("-year")
				.order("-month")
				.order("department_id")
				.offset(page.begin_num)
				.limit(page.query_num)
				.run(this);
		},
		function(err,plans){
			plans=plans||[];
			ctx.plans=page.data(plans);
			ctx.page=page.ret;
			res.render("monthplan/history_list",ctx);
		}
	);
}

exports.one=function(req,res){
	var person=req.pa.person;
	var plan_id=req.query.id;
	var page_numb= req.query.page_numb;
	
	var ctx={pa_id:person.id,page_numb:page_numb};
	step(
		function(){
			var Monthplan=req.models.Monthplan;
			Monthplan.get(plan_id,this);
		},
		function(err,monthplan){
			ctx.plan=monthplan;
			monthplan_service.find_monthplan_items(req.models,monthplan,this);//todo 重构
		},
		function(err,items){
			ctx.items=items;
			return true;
		},
		function(err){
			page='monthplan/history_one';
			res.render(page,ctx);
		}
	);
}