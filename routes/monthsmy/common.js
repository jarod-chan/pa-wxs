var rt = monthsmy_service=require('../../service/monthsmy_service')
	,util=require('util')
	,step=require('step');

exports._next=function(req,callback){
	var person=req.pa.person;
	var smy_id=req.params.id;
	var ids=req.body.id;
	var points=req.body.point;

	//单条记录不为数组
	if(!(ids instanceof Array)){
		ids=[ids];
		points=[points];
	}

	step(
		function(){
			var Msitem=req.models.Msitem;
			var group = this.group();
			for (var i=0,len=ids.length;i<len;i++) {
				Msitem.get(ids[i],group());
			};
		},
		function(err,items){
			var group =this.group();
			for(var i=0,len=items.length;i<len;i++){
				items[i].point=points[i];
				items[i].save(group());
			}
		},
		function(err){
			var Monthsmy=req.models.Monthsmy;
			Monthsmy.get(smy_id,this);
		},
		function(err,monthsmy){
			monthsmy.state='FINISHED';
			monthsmy.save(this);
		},
		callback
	);
	
}

exports._back=function(req,callback){
	var person=req.pa.person;
	var smy_id=req.params.id;
	step(
		function(){
			var Monthsmy=req.models.Monthsmy;
			Monthsmy.get(smy_id,this);
		},
		function(err,monthsmy){
			monthsmy.state='SAVED';
			monthsmy.save(this);
		},
		callback
	);
}