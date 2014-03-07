var orm = require("orm");

exports.bind=function(app){
	
	app.get('/monthplan', function(req, res){ 		
		var person_id=req.query.gm;

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
						res.render('monthplan/list',{
							plans:plans
						});
					});
			};
			
		});
	});

	app.get('/monthplan/:id(\\d+)',function(req,res){
		var monthplan_id=req.params.id; 

		Plan=req.models.Monthplan;
		MPitem=req.models.MPitem;
		Plan.get(monthplan_id,function(err,plan){
			if(plan){
				MPitem.find({idrtaskbill_id:plan.id}
					,'sn'
					,function(err,mpitmes){
						console.log('datas foud',mpitmes.length);
						res.render("monthplan/item",{
							plan:plan,
							mpitmes:mpitmes
						});
				})
			}
		});
	});

	app.post('/monthplan/:id(\\d+)/:action',function(req,res){
		var monthplan_id=req.params.id;
		var action=req.params.action; 

		Plan=req.models.Monthplan;
		Plan.get(monthplan_id,function(err,plan){
			if(plan){
				console.log("action is ",action);
				if(action=="next"){
					plan.state='EXECUTE';
				}else if (action=="back"){
					plan.state='SAVED';
				};
				plan.save(function(err){
					res.send(true);
				});
			}
		});
	});
}
