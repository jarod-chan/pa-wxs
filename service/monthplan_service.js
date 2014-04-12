var exdate = require('exdate')
,help=require('../model/monthplan_help')
,orm=require('orm')
,util=require('util')
,step=require('step');

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
				plan=create_this_month_plan(dept);
			}else{
				plan=plans[0];
				if(plan_is_finished(plan)){
					plan=create_next_month_plan(plan,dept);
				}
			}
			callback(null,plan);
		});
}

function dept_dont_have_plans(plans){
	return plans.length===0;
}

function plan_is_finished(plan){
	return plan.state==='FINISHED';
}

function create_this_month_plan(dept){
	var date=exdate.distance(new Date());
	return create_new_plan(date.getFullYear(),date.getMonth()+1,dept);
}

function create_next_month_plan(plan,dept){
	var date=exdate.distance(new Date(plan.year,plan.month-1,1),1,'M');//月份表示是0-11之间
	return create_new_plan(date.getFullYear(),date.getMonth()+1,dept);

}

function create_new_plan(year,month,dept){
	return {
		id:'',
		year:year,
		month:month,
		department_id:dept.id,
		state:'NEW',
		department:dept,
		get_state: help.get_state,
        get_fmt: help.get_fmt
    }
}

exports.find_monthplan_items=function(models,monthplan,callback){
	var plan_id=monthplan.id;
	if(plan_id){
		var MPitem=models.MPitem;
		MPitem.find({idrtaskbill_id:plan_id})
			.order('sn')
			.run(function(err,items){
				if(err) callback(err);
				callback(null,items);
			});
	}else{
		callback(err,[]);
	}
}

exports.find_mpitem=function(models,item_id,callback){
	var MPitem=models.MPitem;
	MPitem.get(item_id,callback);
}

exports.create_mpitem=function(models,plan_id,callback){
	step(
		function(){
			if(plan_id){
				var MPitem=models.MPitem;
				MPitem.count({idrtaskbill_id:plan_id},this);
			}else{
				return 0;
			}
		},
		function(err,count){
			item={
				id:'',
				idrtaskbill_id:plan_id,
				sn:count+1,
				context:'',
				summary:''
			}
			callback(null,item);
		}
	);
}


exports.save_item=function(models,item,callback){
	var MPitem=models.MPitem;
	if(!item.id) item.id=null;//id为空字符，orm保存有问题
	if(item.id){
		MPitem.get(item.id,function(err,old_item){
			old_item.save(item,callback);
		});
	}else{
		MPitem.create(item,callback);
	}
}

exports.add_monthplan=function(models,montplan,callback){
	var Plan=models.Monthplan;
	var Fmp=models.Fmp;
	delete montplan["get_fmt"];
	delete montplan["get_state"];
	step(
		function(){
			Fmp.create({},this);
		},
		function(err,fmp){
			montplan.id=fmp.id;
			montplan.state='SAVED';
			Plan.create(montplan,this);
		},
		function(err,saved_plan){
			if(err) callback(err);
			callback(null,saved_plan);
		}
	);
}



exports.delete_item=function(models,item_id,callback){
	var MPitem=models.MPitem;
	var ctx={};
	step(
		function(){
			MPitem.get(item_id,this);
		},
		function(err,old_item){
			ctx.plan_id=old_item.idrtaskbill_id;
			ctx.sn=old_item.sn;
			old_item.remove(this);
		},
		function(err){
			MPitem.find({idrtaskbill_id:ctx.plan_id,sn:orm.gt(ctx.sn)}).run(this);
		},
		function(err,items){
			if(items.length==0){
				return true;
			}
			var group = this.group();
			for (var i = items.length - 1; i >= 0; i--) {
				item=items[i];
				item.sn=item.sn-1;
				item.save(group());
			};
		},
		function(err,result){
			if(err) callback(err);
			callback(null);
		}
	);
}

exports.check_submit=function(items){
	if(items.length==0) return{flag:false,message:'部门月度计划不能为空'};
	for (var i = 0;i <items.length; i++ ) {
		item=items[i];
		if(!item.context){
			message=util.format('第%s条【计划】不能为空',item.sn);
			return {flag:false,message:message};
		}
	};
	return  {flag:true,message:'部门月度计划提交成功'};
}


exports.submit=function(models,plan_id,callback){
	var Monthplan=models.Monthplan;
	Monthplan.get(plan_id,function(err,montplan){
		if(err) callback(err);
		montplan.state='SUBMITTED';
		montplan.save(callback);
	});
}

exports.check_finish=function(items){
	if(items.length==0) return{flag:false,message:'部门月度计划不能为空'};
	for (var i = 0;i <items.length; i++ ) {
		item=items[i];
		if(!item.summary){
			message=util.format('第%s条【总结】不能为空',item.sn);
			return {flag:false,message:message};
		}
	};
	return  {flag:true,message:'部门月度计划已完成'};
}

exports.finish=function(models,plan_id,callback){
	var Monthplan=models.Monthplan;
	Monthplan.get(plan_id,function(err,montplan){
		if(err) callback(err);
		montplan.state='FINISHED';
		montplan.save(callback);
	});
}