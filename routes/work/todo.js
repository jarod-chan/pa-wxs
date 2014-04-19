var rt = require("../common/result.js")
	,util=require('util')
	,step=require('step');

//微信最多显示数据限制
var num_limit={
	ret_num:8,//数据库返回条数
	max_num:7,//最多显示条数
	deal_len:function(data_arr){
		if(data_arr.length>this.max_num){
			return {len:this.max_num,more:true}
		}else{
			return {len:data_arr.length,more:false}
		}
	}
}

module.exports=function(req,res){
	var post=req.pa.person_post;
	switch(post){
		case 'G':
			deal_with_g_type(req,res);
			break;
		case 'Y':
			deal_with_y_type(req,res);
			break;
		case 'G_Y':
			deal_with_g_y_type(req,res);
			break;
		default:
			res.send(rt.package(false,'你无权限进行该操作！'));
	}
}

function deal_with_y_type(req,res){
	var person=req.pa.person;

	find_smys(req,function(err,datas){
		var nl=num_limit.deal_len(datas);
		datas=datas.slice(0,nl.len);
		
		var ret={
			result:true,
			data:datas,
			message:'月度工作小结审批'
		}

		if(nl.more){
			ret.more=util.format('/frame/monthsmy/check/list?pa_id=%s',person.id);
		}
		res.send(ret);
	})

}

function deal_with_g_type(req,res){
	var person=req.pa.person;

	find_plans(req,function(err,datas){
		var nl=num_limit.deal_len(datas);
		datas=datas.slice(0,nl.len);
		
		var ret={
			result:true,
			data:datas,
			message:'部门月度计划审批'
		}

		if(nl.more){
			ret.more=util.format('/frame/monthplan/check/list?pa_id=%s',person.id);
		}
		res.send(ret);
	})
}


function deal_with_g_y_type(req,res){
	var person=req.pa.person;
	var ctx={};
	step(
		function(){
			find_smys(req,this)
		},
		function(err,data){
			ctx.data=data;
			find_plans(req,this)
		},
		function(err,data){
			ctx.data=ctx.data.concat(data);
			ctx.data=dataSort(ctx.data);
			return true;
		},
		function(err){
			var datas=ctx.data;
			var nl=num_limit.deal_len(datas);
			datas=datas.slice(0,nl.len);

			var ret={
				result:true,
				data:datas,
				message:'待办工作'
			}

			if(nl.more){
				ret.more=util.format('/frame/monthsmy/check/list?pa_id=%s',person.id);
			}
			res.send(ret);
		}
	);
}

function dataSort(data){
	var len=data.length;
	for (var i = 0; i < len; i++) {
		for (var j = i+1; j < len; j++) {
			if(data[i].date<data[j].date){
				temp=data[j];
				data[j]=data[i];
				data[i]=temp;
			}
		};
	};
	return data;
}


function find_smys(req,callback){
	var person=req.pa.person;
	
	step(
		function(){
			var Person=req.models.Person;
			Person.find({department:person.department,manage:'N'}).run(this);
		},
		function (err,persons){
			var person_ids=[];
			for(var i=0,len=persons.length;i<len;i++){
				person_ids[i]=persons[i].id;
			}
			return person_ids;
		},
		function(err,person_ids){
			var Monthsmy=req.models.Monthsmy;
			Monthsmy.find({state:'SUBMITTED',person_id:person_ids})
				.order("-year")
				.order("-month")
				.order("person_id")
				.limit(num_limit.ret_num)
				.run(this);
		},
		function(err,smys){
			smys=smys||[];
			var fmt_data=[];
			for(var i=0,len=smys.length;i<len;i++){
				fmt_data[i]=smys[i].get_fmt();
				fmt_data[i].url=util.format('/frame/monthsmy/%s/check?pa_id=%s',smys[i].id,person.id);
				fmt_data[i].date=new Date(smys[i].year,smys[i].month-1,1);
			}
			return fmt_data;
		},
		callback
	);
}

function find_plans(req,callback){
	var person=req.pa.person;
	step(
		function(){
			var Dept=req.models.Department;
			Dept.find({gmange_id:person.id}).run(this);
		},
		function(err,depts){
			var dept_ids=[];
			for (var i=0,len=depts.length;i<len;i++){
				dept_ids[i]=depts[i].id;
			}
			return dept_ids;
		},
		function(err,detp_ids){
			var Plan=req.models.Monthplan;
			Plan.find({state:'SUBMITTED',department_id:detp_ids})
				.order("-year")
				.order("-month")
				.order("department_id")
				.limit(num_limit.ret_num)
				.run(this);
		},
		function(err,plans){
			plans=plans||[];
			var fmt_data=[];
			for(var i=0,len=plans.length;i<len;i++){
				fmt_data[i]=plans[i].get_fmt();
				fmt_data[i].url=util.format('/frame/monthplan/%s/check?pa_id=%s',plans[i].id,person.id);
				fmt_data[i].date=new Date(plans[i].year,plans[i].month-1,1);
			}
			return fmt_data;
		},
		callback
	);
}