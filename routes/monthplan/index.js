var rt = require("../common/result.js")
	,msg = require("../common/msg.js")
	,other = require("./other.js")
	,monthplan_service=require('../../service/monthplan_service')
	,util=require('util')
	,step=require('step');

exports.curr=function(req,res){
	var person=req.pa.person;
	var ctx={pa_id:person.id,msg:req.cache_pa.msg()};
	step(
		function(){
			var Dept=req.models.Department;
			Dept.find({name:person.department}).run(this);
		},
		function (err,depts){
			var dept=depts[0];
			monthplan_service.curr_monthplan(req.models,dept,this);
		},
		function (err,monthplan){
			ctx.plan=monthplan;
			monthplan_service.find_monthplan_items(req.models,monthplan,this);
		},
		function(err,items){
			ctx.items=items;
			return true;
		},
		function(err){
			var page='';
			switch(ctx.plan.state){
				case 'NEW':
				case 'SAVED':
					page='edit';
					break;
				case 'EXECUTE':
					page='summary'
					break;
				case 'SUBMITTED':
				case 'FINISHED':
					page='view';
					break;
			}
			page='monthplan/'+page;
			res.render(page,ctx);
		}
	);

}

exports.item=function(req,res){
	var person=req.pa.person;
	var item_id=req.query.id;
	var ctx={pa_id:person.id};
	step(
		function(){
			var Dept=req.models.Department;
			Dept.find({name:person.department}).run(this);
		},
		function (err,depts){
			var dept=depts[0];
			monthplan_service.curr_monthplan(req.models,dept,this);
		},
		function (err,monthplan){
			monthplan_service.find_curr_item(req.models,monthplan,item_id,this);
		},
		function(err,item){
			ctx.item=item;
			res.render('monthplan/item',ctx);
		}
	);
}

exports.save_item=function(req,res){
	var person=req.pa.person;
	var pg_item=req.body;
	if(pg_item.idrtaskbill_id){
		monthplan_service.save_item(req.models,pg_item,function(err,item){
			if(err) console.info(err);
			res.redirect('/monthplan/curr?pa_id='+person.id);
		})
	}else{
		step(
			function(){
				var Dept=req.models.Department;
				Dept.find({name:person.department}).run(this);
			},
			function (err,depts){
				var dept=depts[0];
				monthplan_service.curr_monthplan(req.models,dept,this);
			},
			function (err,monthplan){
				monthplan_service.add_monthplan(req.models,monthplan,this);
			},
			function(err,monthplan){
				pg_item.idrtaskbill_id=monthplan.id;
				monthplan_service.save_item(req.models,pg_item,this);
			},
			function(err){
				if(err) console.log(err);
				res.redirect('/monthplan/curr?pa_id='+person.id);
			}
		);
	}
}

exports.delete_item=function(req,res){
	var person=req.pa.person;
	var item_id=req.body.id;
	monthplan_service.delete_item(req.models,item_id,function(err){
		res.redirect('/monthplan/curr?pa_id='+person.id);
	});
}

exports.submit=function(req,res){
	var person=req.pa.person;
	var plan_id=req.body.id;
	step(
		function(){
			monthplan_service.find_monthplan_items(req.models,{id:plan_id},this);
		},
		function(err,items){
			var msg=monthplan_service.check_submit(items);
			req.cache_pa.msg(msg);
			if(msg.result){
				monthplan_service.submit(req.models,plan_id,this);
			}else{
				return true;
			}
		},
		function(err){
			if(err) console.info(err);
			res.redirect('/monthplan/curr?pa_id='+person.id);
		}
	);
}

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

exports.item_smy=other.item_smy
exports.save_item_smy=other.save_item_smy
exports.delete_item_smy=other.delete_item_smy
exports.finish=other.finish