var rt = require("../common/result.js")
	,util=require('util')
	,step=require('step');

module.exports=function(req,res){
	var post=req.pa.person_post;
	switch(post){
		case 'G':
			deal_with_g_type(req,res);
			break;
		case 'Y':
			deal_with_y_type(req,res);
			break;
		default:
			res.send(rt.package(false,'你无权限进行该操作！'));
	}
}

function deal_with_y_type(req,res){
	var person=req.pa.person;
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
				.limit(9)
				.run(this);
		},
		function(err,smys){
			var fmt_data=[];
			for(var i=0,len=smys.length;i<len;i++){
				fmt_data[i]=smys[i].get_fmt();
				fmt_data[i].url=util.format('/monthsmy/%s/check?pa_id=%s',smys[i].id,person.id);
			}
			res.send(rt.package(true,fmt_data,'月度工作小结审批'));
		}
	);
}

function deal_with_g_type(req,res){
	var person=req.pa.person;
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
				.limit(9)
				.run(this);
		},
		function(err,plans){
			var fmt_data=[];
			for(var i=0,len=plans.length;i<len;i++){
				fmt_data[i]=plans[i].get_fmt();
				fmt_data[i].url=util.format('/monthplan/%s/check?pa_id=%s',plans[i].id,person.id);
			}
			res.send(rt.package(true,fmt_data,'部门月度计划审批'));
		}
	);
}