var util=require('util');

exports.get_state=function () {
   var state_map={
		NEW:'新建',
		SAVED:'暂存',
		SUBMITTED:'已提交',
		EXECUTE:'执行中',
		FINISHED:'已完成'
   }
   return state_map[this.state];
}

exports.get_fmt=function(){
	var info=util.format('%s年%s月%s部门月度计划',this.year,this.month,this.department.name); 
	return {
		id:this.id,
		fullname:info,
		state:this.get_state()
	}
}