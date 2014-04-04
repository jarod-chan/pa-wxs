var exdate = require('exdate')
	,help=require('../model/monthsmy_help')
	,step=require('step')
	,util=require('util')
	,orm=require('orm');

//当前月总结
exports.curr_monthsmy = function(models,person,callback) {
	var Monthsmy=models.Monthsmy;
	Monthsmy.find({person_id:person.id})
		.order("-year")
		.order("-month")
		.limit(1)
		.run(function(err,monthsmys){
			if(err) {callback(err); return;}
			var monthsmy={};
			if(person_dont_have_monthsmy(monthsmys)){
				monthsmy=create_prev_month_monthsmy(person);
			}else{
				monthsmy=monthsmys[0];
				if(monthsmy_is_finished(monthsmy)){
					monthsmy=create_next_month_monthsmy(monthsmy,person);
				}
			}
			callback(null,monthsmy);
		});
}

function person_dont_have_monthsmy(monthsmys){
	return monthsmys.length===0;
}

function monthsmy_is_finished(monthsmy){
	return monthsmy.state==='FINISHED';
}

function create_prev_month_monthsmy(person){
	var date=exdate.distance(new Date(), -1, 'M');
	return create_new_monthsmy(date.getFullYear(),date.getMonth()+1,person);
}

function create_next_month_monthsmy(monthsmy,person){
	var date=exdate.distance(new Date(monthsmy.year,monthsmy.month-1,1),1,'M');//月份表示是0-11之间
	return create_new_monthsmy(date.getFullYear(),date.getMonth()+1,person);

}

function create_new_monthsmy(year,month,person){
	return {
		year: year,
		month: month,
		person_id:person.id,
		state:'NEW',
		person:person,
		get_state:help.get_state,
		get_fmt:help.get_fmt
	};
}

exports.find_monthsmy_items=function(models,monthsmy,callback){
	var monthsmy_id=monthsmy.id;
	if(monthsmy_id){
		var Msitem=models.Msitem;
		Msitem.find({monthchk_id:monthsmy_id})
			.order('sn')
			.run(function(err,items){
				if(err) callback(err);
				callback(null,items);
			});
	}else{
		callback(null,[]);
	}
}

exports.find_curr_item=function(models,monthsmy_id,item_sn,callback){
	var Msitem=models.Msitem;
	var item={};
	if(monthsmy_id){
		Msitem.find({monthchk_id:monthsmy_id,sn:item_sn})
			.run(function(err,items){
				if(err) callback(err);
				if(items.length===0){
					item=create_new_msitem(monthsmy_id,item_sn);
				}else{
					item=items[0];
				}
				callback(null,item);
			});
	}else{
		item=create_new_msitem('',1);
		callback(null,item);
	}
}

function create_new_msitem(monthsmy_id,item_sn){
	return {
		id: '',
		monthchk_id: monthsmy_id,
		worktype_id:'',
		sn: item_sn,
		task:'',
		workhour:'',//浮点数
		get_fmt_workhour:help.get_fmt_workhour
	}
}

exports.find_worktypes=function(models,callback){
	var Worktype=models.Worktype;
	Worktype.find()
		.order('sn')
		.run(function(err,items){
			if(err) callback(err);
			callback(null,items);
		});
}

exports.save_item=function(models,item,callback){
	var Msitem=models.Msitem;
	if(!item.id) item.id=null;
	if(!item.workhour) item.workhour=null;
	if(item.id){
		Msitem.get(item.id,function(err,old_item){
			item.worktype={id:item.worktype_id};
			old_item.save(item,callback);
		})
	}else{
		Msitem.create([item],callback);
	}
}

exports.add_monthsmy=function(models,monthsmy,callback){
	var Monthsmy=models.Monthsmy;
	Monthsmy.create([monthsmy],function(err,smys){
		if(err) callback(err);
		callback(err,smys[0]);
	});
}

exports.delete_item=function(models,item_id,callback){
	var Msitem=models.Msitem;
	var ctx={};
	step(
		function(){
			Msitem.get(item_id,this);
		},function(err,old_item){
			ctx.smy_id=old_item.monthchk_id;
			ctx.sn=old_item.sn;
			old_item.remove(this);
		},
		function(err){
			Msitem.find({monthchk_id:ctx.smy_id,sn: orm.gt(ctx.sn)}).run(this);
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
		function (err,result) {
			callback(null);
		}
	);
}

exports.check_submit=function(items){
	if(items.length==0) return {result:false,message:'月度工作小结不能为空。'};
	for (var i = 0; i < items.length; i++) {
		item=items[i];
		if(!item.task){
			message=util.format('第%s条总结的【工作内容】不能为空。',item.sn);
			return {result:false,message:message};
		}
		if(!item.workhour){
			message=util.format('第%s条总结【用时】不能为空。',item.sn);
			return {result:false,message:message};
		}
	};
	return {result:true,message:'月度工作小结提交成功。'};
}

exports.submit=function(models,smy_id,callback){
	var Monthsmy=models.Monthsmy;
	Monthsmy.get(smy_id,function(err,smy){
		if(err) callback(err);
		smy.state='SUBMITTED';
		smy.save(callback)
	});
}

/*
console.info("test begin------------");

var x=create_prev_month_monthsmy({id:1,name:'用户1'});
console.info("year"+x.year+"month"+x.month);
var y=create_next_month_monthsmy(x,{id:1,name:'用户1'});
console.info("year"+y.year+"month"+y.month);
var fmt=y.get_fmt();
console.info(fmt.id);
console.info(fmt.fullname);
console.info(fmt.state);

console.info("test end--------------");
*/