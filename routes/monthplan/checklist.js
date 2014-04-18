var rt = require("../common/result.js")
	,msg=require("../common/msg.js")
	,monthplan_service=require('../../service/monthplan_service')
	,util=require('util')
	,step=require('step');

exports.list=function(req,res){
	var person=req.pa.person;
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
			Plan.find({state:'SUBMITTED',department_id:detp_ids})
				.order("-year")
				.order("-month")
				.order("department_id")
				.run(this);
		},
		function(err,plans){
			ctx.plans=plans||[];
			res.render("monthplan/check_list",ctx);
		}
	);
}

exports.check_one=function(req,res){
	var person=req.pa.person;
	var plan_id=req.query.id; 
	var ctx={pa_id:person.id};
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
			page='monthplan/check_one';
			res.render(page,ctx);
		}
	);
}

exports._next=function(req,res){
	var person=req.pa.person;
	var plan_id=req.params.id;
	step(
		function(){
			var Monthplan=req.models.Monthplan;
			Monthplan.get(plan_id,this);
		},
		function(err,monthplan){
			monthplan.state='EXECUTE';
			monthplan.save(this);
		},
		function(err){
			if(err) console.info(err);
			req.cache_pa.msg(msg.create(true,'部门月度计划已通过'));
			res.send("true");
		}
	);
	
}

exports._back=function(req,res){
	var person=req.pa.person;
	var plan_id=req.params.id;
	step(
		function(){
			var Monthplan=req.models.Monthplan;
			Monthplan.get(plan_id,this);
		},
		function(err,monthplan){
			monthplan.state='SAVED';
			monthplan.save(this);
		},
		function(err){
			if(err) console.info(err);
			req.cache_pa.msg(msg.create(true,'部门月度计划已打回'));
			res.send("true");
		}
	);
	
}