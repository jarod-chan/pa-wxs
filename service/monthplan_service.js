var exdate = require('exdate');
var help=require('../model/monthplan_help');

exports.curr_monthplan=function(models,department,callback){
	var Plan=models.Monthplan;
	var dept=department;
	Plan.find({department_id:dept.id})
		.order("-year")
		.order("-month")
		.limit(1)
		.run(function(err,plans){
			if(err){callback(err);return};
			var plan={};
			if(dept_dont_have_plans(plans)){
				plan=create_prev_month_plans(dept);
			}else{
				plan=plans[0];
				if(plan_is_finished(plan)){
					plan=create_next_month_plan(plan,dept);
				}
			}
			return callback(null,plan);
		});
}

function dept_dont_have_plans(plans){
	return plans.length===0;
}

function plan_is_finished(plan){
	return plan.state==='FINISHED';
}

function create_prev_month_plans(dept){
	var date=exdate.distance(new Date(), -1, 'M');
	return create_new_plan(date.getFullYear(),date.getMonth()+1,dept);
}

function create_next_month_plan(plan,dept){
	var date=exdate.distance(new Date(plan.year,plan.month-1,1),1,'M');//月份表示是0-11之间
	return create_new_monthsmy(date.getFullYear(),date.getMonth()+1,dept);

}

function create_new_plan(year,month,dept){
	return {
		year:year,
		month:month,
		department_id:dept.id,
		state:'NEW',
		department:dept,
		get_state: help.get_state,
        get_fmt: help.get_fmt
    }
}

/*
console.info("test begin-----------");

*/