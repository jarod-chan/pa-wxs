var rt = require("../common/result.js")
	,msg=require("../common/msg.js")
	,monthsmy_service=require('../../service/monthsmy_service')
	,util=require('util')
	,step=require('step')
	,common=require('./common');

exports.check=function(req,res){
	var person=req.pa.person;
	var smy_id=req.params.id; 
	var ctx={pa_id:person.id,msg:req.cache_pa.msg()};
	step(
		function(){
			var Monthsmy=req.models.Monthsmy;
			Monthsmy.get(smy_id,this);
		},
		function(err,monthsmy){
			ctx.smy=monthsmy;
			monthsmy_service.find_monthsmy_items(req.models,monthsmy,this);//todo 重构
		},
		function(err,items){
			ctx.items=items;
			return true;
		},
		function(err){
			var page='view';
			if(ctx.smy.state=='SUBMITTED'){
				page='check';
			}
			page='monthsmy/'+page;
			res.render(page,ctx);
		}
	);
}

exports._next=function(req,res){
	common._next(req,function(err){
		res.send(msg.create(true,'月度工作小结已通过'));
	});
}

exports._back=function(req,res){
	common._back(req,function(err){
			res.send(msg.create(true,'月度工作小结已打回'));
	});
}