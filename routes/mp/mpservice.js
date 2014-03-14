var rt = require("../common/result.js");

var inject_person_id=function(param_name,require_id){
	return function(req,res,next){
		req.pa.person_id=req.query[param_name];
		if(req.pa.person_id===require_id){
			next();	
		}else{
			res.send(rt.package(false,'你去权限进行该操作！'));
		}
		
	}
}

exports.bind=function(app){
	var init_id=inject_person_id("pa_id",'5');
	
	//已办
	app.get("/mp/finished",
		init_id,
		function(req,res){
		var person_id=req.pa.person_id;

		Dept=req.models.Department;
		Plan=req.models.Monthplan;
		Dept.find({gmange_id:person_id},function(err,depts){
		 	console.log("depts found",depts.length);
			if(depts){
				var depts_id=[];
				for (var i = 0; i < depts.length; i++) {
					depts_id[i]=depts[i].id;
				};
				Plan.find({department_id:depts_id,state:'FINISHED'})
					.order("-year")
					.order("-month")
					.limit(10)
					.run(function(err,plans){
						console.log('plans found',plans.length);
						var fmt_plans=[];
						for(var i=0;i<plans.length;i++){
							fmt_plans[i]=plans[i].get_fmt();
						}
						res.send(rt.package(true,fmt_plans));
					});
			};
		});
	});
	//待办
	app.get("/mp/execute",
		init_id,
		function(req,res){
		var person_id=req.pa.person_id;

		Dept=req.models.Department;
		Plan=req.models.Monthplan;
		Dept.find({gmange_id:person_id},function(err,depts){
		 	console.log("depts found",depts.length);
			if(depts){
				var depts_id=[];
				for (var i = 0; i < depts.length; i++) {
					depts_id[i]=depts[i].id;
				};
				Plan.find({department_id:depts_id,state:'EXECUTE'})
					.order("-year")
					.order("-month")
					.limit(10)
					.run(function(err,plans){
						console.log('plans found',plans.length);
						var fmt_plans=[];
						for(var i=0;i<plans.length;i++){
							fmt_plans[i]=plans[i].get_fmt();
						}
						res.send(rt.package(true,fmt_plans));
					});
			};
		});
	});
	//在办
	app.get("/mp/submitted",
		init_id,
		function(req,res){
		var person_id=req.pa.person_id;

		Dept=req.models.Department;
		Plan=req.models.Monthplan;
		Dept.find({gmange_id:person_id},function(err,depts){
		 	console.log("depts found",depts.length);
			if(depts){
				var depts_id=[];
				for (var i = 0; i < depts.length; i++) {
					depts_id[i]=depts[i].id;
				};
				Plan.find({department_id:depts_id,state:'SUBMITTED'})
					.order("year")
					.order("month")
					.limit(10)
					.run(function(err,plans){
						console.log('plans found',plans.length);
						var fmt_plans=[];
						for(var i=0;i<plans.length;i++){
							fmt_plans[i]=plans[i].get_fmt();
						}
						res.send(rt.package(true,fmt_plans));
					});
			};
		});
	});



	var inject_manage=inject_person_id("pa_id",'205');

	app.get('/mp/newurl'
		,inject_manage
		,function(req,res){
			res.send(rt.package(true,'/mp/new?pa_id='+req.pa.person_id));
		})

}
