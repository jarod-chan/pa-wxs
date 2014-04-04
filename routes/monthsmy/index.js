var rt = require("../common/result.js")
	,monthsmy_service=require('../../service/monthsmy_service')
	,util=require('util')
	,step=require('step');


exports.curr=function(req,res){
	var person=req.pa.person;
	var ctx={pa_id:person.id,msg:req.cache_pa.msg()};
	step(
		function find_curr_monthsmy(){
			monthsmy_service.curr_monthsmy(req.models,person,this);
		},
		function (err,monthsmy){
			ctx.smy=monthsmy;
			monthsmy_service.find_monthsmy_items(req.models,monthsmy,this);
		},
		function(err,items){
			ctx.items=items;
			return true;
		},
		function(err){
			var page='';
			switch(ctx.smy.state){
				case 'NEW':
				case 'SAVED':
					page='edit';
					break;
				case 'SUBMITTED':
				case 'FINISHED':
					page='view';
					break;
			}
			page='monthsmy/'+page;
			res.render(page,ctx);
		}
	);

}

exports.item=function(req,res){
	var person=req.pa.person;
	var item_sn=req.query.sn;
	var ctx={pa_id:person.id};
	step(
		function(){
			monthsmy_service.curr_monthsmy(req.models,person,this);
		},
		function(err,monthsmy){
			monthsmy_service.find_curr_item(req.models,monthsmy.id,item_sn,this);
		},
		function(err,item){
			ctx.item=item;
			monthsmy_service.find_worktypes(req.models,this);
		},function(err,worktypes){
			ctx.worktypes=worktypes;
			res.render('monthsmy/item',ctx);
		}
	)
}

exports.save_item=function(req,res){
	var person=req.pa.person;
	var pg_item=req.body;
	if(pg_item.monthchk_id){
		monthsmy_service.save_item(req.models,pg_item,function(err,items){
			if(err) console.info(err);
			res.redirect('/monthsmy/curr?pa_id='+person.id);
		});
	}else{
		step(
			function(){
				monthsmy_service.curr_monthsmy(req.models,person,this);
			},
			function(err,monthsmy){
				monthsmy_service.add_monthsmy(req.models,monthsmy,this);
			},
			function(err,monthsmy){
				pa_item.monthchk_id=monthsmy.id;
				monthsmy_service.save_item(req.models,pg_item,this);
			},
			function(err){
				console.log("=========================");
				res.redirect('/monthsmy/curr?pa_id='+person.id);
			}
		);
	}	
}

exports.delete_item=function(req,res){
	var person=req.pa.person;
	var item_id=req.body.id;
	monthsmy_service.delete_item(req.models,item_id,function(){	
		res.redirect('/monthsmy/curr?pa_id='+person.id);
	})
}

exports.submit=function(req,res){
	var person=req.pa.person;
	var smy_id=req.body.id;
	step(
		function(){
			monthsmy_service.find_monthsmy_items(req.models,{id:smy_id},this);
		},
		function(err,items){
			var msg=monthsmy_service.check_submit(items);
			req.cache_pa.msg(msg);
			if(msg.result){
				monthsmy_service.submit(req.models,smy_id,this);
			}else{
				return true;
			}
		},
		function(err){
			if(err) console.info(err);
			res.redirect('/monthsmy/curr?pa_id='+person.id);
		}
	);
}