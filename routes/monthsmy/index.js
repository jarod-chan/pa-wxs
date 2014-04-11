var rt = require("../common/result.js")
	,msg=require("../common/msg.js")
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
	var smy_id=req.params.id;
	var ids=req.body.id;
	var points=req.body.point;
	step(
		function(){
			var Msitem=req.models.Msitem;
			var group = this.group();
			for (var i=0,len=ids.length;i<len;i++) {
				Msitem.get(ids[i],group());
			};
		},
		function(err,items){
			var group =this.group();
			for(var i=0,len=items.length;i<len;i++){
				items[i].point=points[i];
				items[i].save(group());
			}
		},
		function(err){
			var Monthsmy=req.models.Monthsmy;
			Monthsmy.get(smy_id,this);
		},
		function(err,monthsmy){
			monthsmy.state='FINISHED';
			monthsmy.save(this);
		},
		function(err){
			res.send(msg.create(true,'月度工作小结已通过'));
		}
	);
	
}

exports._back=function(req,res){
	var smy_id=req.params.id;
	step(
		function(){
			var Monthsmy=req.models.Monthsmy;
			Monthsmy.get(smy_id,this);
		},
		function(err,monthsmy){
			monthsmy.state='SAVED';
			monthsmy.save(this);
		},
		function(err){
			res.send(msg.create(true,'月度工作小结已打回'));
		}
	);
	
}