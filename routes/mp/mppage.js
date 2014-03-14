var msg = require("../common/msg.js");
var rt = require("../common/result.js");

var inject_person_id=function(param_name){
	return function(req,res,next){
		req.pa.person_id=req.query[param_name];
		if(req.pa.person_id==='205'){
			next();	
		}else{
			res.send(rt.package(false,'你去权限进行该操作！'));
		}
	}
}

exports.bind=function(app){
	var init_id=inject_person_id("pa_id");
	
	app.get('/mp/new'
		,init_id
		,function(req,res){
			var person_id=req.pa.person_id;

			var deal_plan=function(plan){
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
						deal_plan(plan);
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


}
