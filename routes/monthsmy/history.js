var rt = require("../common/result.js")
	,msg=require("../common/msg.js")
	,bd_page=require("../common/page.js")
	,monthsmy_service=require('../../service/monthsmy_service')
	,util=require('util')
	,step=require('step');

exports.list=function(req,res){
	var person=req.pa.person;
	var page_numb=req.query.page_numb; // console.info(page_numb);
	var page=bd_page(page_numb); //console.info(page);

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
			Monthsmy.find({state:'FINISHED',person_id:person_ids})
				.order("-year")
				.order("-month")
				.order("person_id")
				.offset(page.begin_num)
				.limit(page.query_num)
				.run(this);
		},
		function(err,smys){
			smys=smys||[];
			ctx.smys=page.data(smys);
			ctx.page=page.ret;
			
			res.render("monthsmy/history_list",ctx);
		}
	);
}

exports.one=function(req,res){
	var person=req.pa.person;
	var smy_id=req.query.id; 
	var page_numb=req.query.page_numb;

	var ctx={pa_id:person.id,page_numb:page_numb};
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
			page='monthsmy/history_one';
			res.render(page,ctx);
		}
	);
}
