var rt = require("../common/result.js")
	,monthsmy_service=require('../../service/monthsmy_service')
	,monthplan_service=require('../../service/monthplan_service')
	,util=require('util')
	,async=require('async');

exports.menu=function(req,res){
	var post=req.pa.person_post;
	switch(post){
		case 'Y':
			deal_with_y_type(req,res);
			break;
		case 'N':
			deal_with_n_type(req,res);
			break;
		case 'G_Y':
			deal_with_y_type(req,res);//跟部门经理相同处理
			break;
		default:
			res.send(rt.package(false,'你无权限进行该操作！'));
	}

}

function deal_with_y_type(req,res){
	var person=req.pa.person;
	var dept_name=person.department;
	var Dept=req.models.Department;
	async.waterfall([
		function find_dept(callback){
			Dept.find({name:dept_name},function(err,depts){
				if(depts.length>0){
					var dept=depts[0];
					console.info("find department:",dept.id);
					callback(null,dept);
				}
			});
		} 
	],function (err, dept) {
		monthplan_service.curr_monthplan(req.models,dept,function(err,monthplan){
			var fmt=monthplan.get_fmt();
			fmt.url=util.format('/frame/monthplan/curr?pa_id=%s',person.id);
			res.send(rt.package(true,fmt));
		});
	});

}

function deal_with_n_type(req,res){
	var person=req.pa.person;
	monthsmy_service.curr_monthsmy(req.models,person,function(err,monthsmy){
		var fmt=monthsmy.get_fmt();
		fmt.url=util.format('/frame/monthsmy/curr?pa_id=%s',person.id);
		res.send(rt.package(true,fmt));
	});	
}