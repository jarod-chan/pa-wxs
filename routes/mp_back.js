var msg = require("./common/msg.js");
var util = require("util");

var inject_person_id=function(param_name){
	return function(req,res,next){
		req.pa.person_id=req.query[param_name];
		next();
	}
}

exports.bind=function(app){
	var set_gm_to_person_id=inject_person_id("mg");
	
	app.get('/mp/new'
		,set_gm_to_person_id
		,function(req,res){
			var person_id=req.pa.person_id;

			var del_plan=function(plan){
				var year=plan.year;
				var month=plan.month;
				var month=month+1;
				if(month>12){
					year=year+1;
					month=1;
				}
				var new_plan={year:year,month:month,department:plan.department};
				res.render("mp/new",{
					plan:new_plan
				});
			}

			var find_monthplan=function(dept_id){
				Plan=req.models.Monthplan;
				MPitem=req.models.MPitem;
				Plan.find({department_id:dept_id})
					.order("-year")
					.order("-month")
					.limit(1)
					.run(function(err,plans){
						console.info("3.",plans.length);
						var plan=plans[0];
						del_plan(plan);
					});
			} 

			var find_dept=function(department_name){
				var Dept=req.models.Department;
				Dept.find({name:department_name},function(err,depts){
					if(depts.length>0){
						var dept=depts[0];
						console.info("2.",dept.id);
						find_monthplan(dept.id);
					}
				});
			}
			
			var Person=req.models.Person;
			Person.get(person_id,function(err,person){
				if(person){
					var department_name=person.department;
					console.info("1.",department_name);
					find_dept(department_name);
				}
			});
		}
	);

	app.post('/mp/save',function(req,res){
		var plan={};
		plan.year=req.body.year;
		plan.month=req.body.month;
		plan.department_id=req.body.department_id;
		plan.state='SUBMITTED';

		var Fmp=req.models.Fmp;
		var Plan=req.models.Monthplan;
		var MPitem=req.models.MPitem;

		Fmp.create([{}],function(err,fmps){
			var fmp=fmps[0];
			plan.id=fmp.id;
			Plan.create([plan],function(err,saved_plans){
				var saved_plan=saved_plans[0];
				if(saved_plan){
					var contexts=req.body.context;
					var mpitems=[];
					for (var i = 0; i < contexts.length; i++) {
						mpitems[i]={};
						mpitems[i].sn=i+1;
						mpitems[i].context=contexts[i];
						mpitems[i].idrtaskbill_id=saved_plan.id;
					};
					MPitem.create(mpitems,function(err,saved_mpitems){
						res.send(msg.create(true,'月计划已经提交！'));
					});
				}
			});
		});

		

	});

	app.get('/mp/:id(\\d+)/rest',function(req,res){
		var monthplan_id=req.params.id;
		var action=req.params.action; 

		Plan=req.models.Monthplan;
		Plan.get(monthplan_id,function(err,plan){
			if(plan){
				var action_info="已提交";
				plan.state='SUBMITTED';
				plan.save(function(err){
					var info=util.format('%s年%s月%s工作执行情况%s。',plan.year,plan.month,plan.department.name,action_info); 
					res.send(msg.create(true,info));
				});
			}
		});
	});

	app.get('/mp/all', function(req, res){ 		
		var person_id=req.query.gm;

		if(!person_id){
			res.send({
				error:"can't get param id"
			});
		}

		Dept=req.models.Department;
		Plan=req.models.Monthplan;
		Dept.find({gmange_id:person_id},function(err,depts){
		 	console.log("depts found",depts.length);
			if(depts){
				var depts_id=[];
				for (var i = 0; i < depts.length; i++) {
					depts_id[i]=depts[i].id;
				};
				Plan.find({department_id:depts_id,state:['SUBMITTED','EXECUTE']}
					,'year'
					,'month'
					,function(err,plans){
						console.log('plans found',plans.length);
						var fmt_plans=[];
						for(var i=0;i<plans.length;i++){
							fmt_plans[i]=plans[i].get_fmt();
						}
						res.send(fmt_plans);
					});
			};
			
		});
	});


	app.get('/mp/:id(\\d+)',function(req,res){
		var monthplan_id=req.params.id; 

		Plan=req.models.Monthplan;
		MPitem=req.models.MPitem;
		Plan.get(monthplan_id,function(err,plan){
			if(plan){
				MPitem.find({idrtaskbill_id:plan.id}
					,'sn'
					,function(err,mpitmes){
						console.log('datas foud',mpitmes.length);
						res.render("monthplan/mp",{
							plan:plan,
							mpitmes:mpitmes
						});
				})
			}
		});
	});

	app.post('/mp/:id(\\d+)/:action',function(req,res){
		var monthplan_id=req.params.id;
		var action=req.params.action; 

		Plan=req.models.Monthplan;
		Plan.get(monthplan_id,function(err,plan){
			if(plan){
				var action_info="";
				if(action=="next"){
					plan.state='EXECUTE';
					action_info="已执行";
				}else if (action=="back"){
					plan.state='SAVED';
					action_info="已打回";
				};
				plan.save(function(err){
					var info=util.format('%s年%s月%s工作执行情况%s。',plan.year,plan.month,plan.department.name,action_info); 
					res.send(msg.create(true,info));
				});
			}
		});
	});


}
