var rt = require("../common/result.js")
	,msg = require("../common/msg.js")
	,monthplan_service=require('../../service/monthplan_service')
	,step=require('step');


exports.item_smy=function(req,res){
	var person=req.pa.person;
	var item_id=req.query.item_id;
	var plan_id=req.query.plan_id;
	var ctx={pa_id:person.id};
	if(item_id){
		step(
			function(){
				var MPitem=req.models.MPitem;
				MPitem.get(item_id,this);
			},
			function(err,item){
				ctx.item=item;
				res.render('monthplan/item_smy',ctx);
			}
		)
	}
	if(plan_id){
		step(
			function(){
				var MPitem=req.models.MPitem;
				MPitem.count({idrtaskbill_id:plan_id},this);
			},
			function(err,count){
				ctx.item={
					id:'',
					idrtaskbill_id:plan_id,
					sn:count+1,
					summary:""
				}
				res.render('monthplan/item_smy',ctx);
			}
		)
	}
}

exports.save_item_smy=function(req,res){
	var person=req.pa.person;
	var pg_item=req.body;
	if(pg_item.id){
		step(
			function(){
				var MPitem=req.models.MPitem;
				MPitem.get(pg_item.id,this);
			},
			function(err,mpitem){
				mpitem.save(pg_item,this);
			},
			function(err){
				res.redirect('/monthplan/curr?pa_id='+person.id);
			}
		);
	}else{
		step(
			function(){
				delete pg_item["id"];
				var MPitem=req.models.MPitem;
				MPitem.create(pg_item,this);
			},
			function(err){
				res.redirect('/monthplan/curr?pa_id='+person.id);
			}
		);
	}
}

exports.delete_item_smy=function(req,res){
	var person=req.pa.person;
	var item_id=req.body.id;
	monthplan_service.delete_item(req.models,item_id,function(err){
		res.redirect('/monthplan/curr?pa_id='+person.id);
	});
}

exports.finish=function(req,res){
	var person=req.pa.person;
	var plan_id=req.body.id;
	var ctx={};
	step(
		function(){
			monthplan_service.find_monthplan_items(req.models,{id:plan_id},this);
		},
		function(err,items){
			ctx.msg=monthplan_service.check_finish(items);
			if(ctx.msg.flag){
				monthplan_service.finish(req.models,plan_id,this);
			}else{
				return true;
			}
		},
		function(err){
			if(err) console.info(err);
			res.send(ctx.msg);
		}
	);
}