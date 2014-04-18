var rt = require("../common/result.js")
	,msg = require("../common/msg.js")
	,monthplan_service=require('../../service/monthplan_service')
	,util=require('util')
	,step=require('step');


exports.check=function(req,res){
	var person=req.pa.person;
	var plan_id=req.params.id; 
	var ctx={pa_id:person.id,msg:req.cache_pa.msg()};
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
			var page='view';
			if(ctx.plan.state=='SUBMITTED'){
				page='check';
			}
			page='monthplan/'+page;
			res.render(page,ctx);
		}
	);
}

exports._next=function(req,res){
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
			res.send(msg.create(true,'部门月度计划已通过'));
		}
	);
	
}

exports._back=function(req,res){
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
			res.send(msg.create(true,'部门月度计划已打回'));
		}
	);
	
}
