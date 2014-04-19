var rt = require("../common/result.js")
	,msg=require("../common/msg.js")
	,common=require("./common.js")
	,monthsmy_service=require('../../service/monthsmy_service')
	,util=require('util')
	,step=require('step');

exports.list=function(req,res){
	var person=req.pa.person;
	var ctx={pa_id:person.id,msg:req.cache_pa.msg(),post:req.pa.person_post};
	step(
		function(){
			var Person=req.models.Person;
			Person.find({department:person.department,manage:'N'}).run(this);
		},
		function (err,persons){
			var person_ids=[];
			for(var i=0,len=persons.length;i<len;i++){
				person_ids[i]=persons[i].id;
			}
			return person_ids;
		},
		function(err,person_ids){
			var Monthsmy=req.models.Monthsmy;
			Monthsmy.find({state:'SUBMITTED',person_id:person_ids})
				.order("-year")
				.order("-month")
				.order("person_id")
				.run(this);
		},
		function(err,smys){
			smys=smys||[];
			var fmt_data=[];
			for(var i=0,len=smys.length;i<len;i++){
				fmt_data[i]=smys[i].get_fmt();
				fmt_data[i].url=util.format('/monthsmy/%s/check?pa_id=%s',smys[i].id,person.id);
			}
			ctx.smys=fmt_data;
			
			res.render("monthsmy/check_list",ctx);
		}
	);
}

exports.check_one=function(req,res){
	var person=req.pa.person;
	var smy_id=req.query.id; 
	var ctx={pa_id:person.id};
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
			page='monthsmy/check_one';
			res.render(page,ctx);
		}
	);
}

exports._next=function(req,res){
	common._next(req,function(err){
		if(err) console.info(err);
		req.cache_pa.msg(msg.create(true,'月度工作小结已通过'));
		res.send(true);
	});
}

exports._back=function(req,res){
	common._back(req,function(err){
			if(err) console.info(err);
			req.cache_pa.msg(msg.create(true,'月度工作小结已打回'));
			res.send(true);
	});	
}