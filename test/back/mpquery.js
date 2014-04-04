var msg = require("./common/msg.js");
var util = require("util");

exports.bind=function(app){

	

	app.get('/mp/year', function(req, res){ 		
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
