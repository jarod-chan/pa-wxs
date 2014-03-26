var exdate = require('exdate');
var help=require('../model/monthsmy_help');

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