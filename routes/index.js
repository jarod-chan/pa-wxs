var rt = require('./common/result')
	,auth = require('./auth/paauth')
	,monthsmy=require('./monthsmy')
	,monthplan=require('./monthplan')
	,func=require('./func/func')
	,work=require('./work')
	,frame=require('./frame')
	,conf=require('../conf/conf.json');


module.exports = function(app) {
    app.get('/bind', auth.bind);
	app.post('/auth',auth.do_auth);

	app.get('/func',post_check(['Y','N']));
	app.get('/func',func.menu);

	//员工
	app.get('/monthsmy/curr',post_check('N'));
	app.get('/monthsmy/curr',monthsmy.curr);

	app.get('/monthsmy/item',post_check('N'));
	app.get('/monthsmy/item',monthsmy.item);

	app.post('/monthsmy/item/save',post_check('N'));
	app.post('/monthsmy/item/save',monthsmy.save_item);

	app.post('/monthsmy/item/delete',post_check('N'));
	app.post('/monthsmy/item/delete',monthsmy.delete_item);

	app.post('/monthsmy/submit',post_check('N'));
	app.post('/monthsmy/submit',monthsmy.submit);

	//部门计划
	app.get('/monthplan/curr',post_check(['Y','G_Y']));
	app.get('/monthplan/curr',monthplan.curr);

	app.get('/monthplan/item',post_check(['Y','G_Y']));
	app.get('/monthplan/item',monthplan.item);

	app.post('/monthplan/item/save',post_check(['Y','G_Y']));
	app.post('/monthplan/item/save',monthplan.save_item);

	app.post('/monthplan/item/delete',post_check(['Y','G_Y']));
	app.post('/monthplan/item/delete',monthplan.delete_item);

	app.post('/monthplan/submit',post_check(['Y','G_Y']));
	app.post('/monthplan/submit',monthplan.submit);

	//总结
	app.get('/monthplan/item_smy',post_check(['Y','G_Y']));
	app.get('/monthplan/item_smy',monthplan.item_smy);

	app.post('/monthplan/item_smy/save',post_check(['Y','G_Y']));
	app.post('/monthplan/item_smy/save',monthplan.save_item_smy);

	app.post('/monthplan/item_smy/delete',post_check(['Y','G_Y']));
	app.post('/monthplan/item_smy/delete',monthplan.delete_item_smy);

	app.post('/monthplan/finish',post_check(['Y','G_Y']));
	app.post('/monthplan/finish',monthplan.finish);


	//分管副总和部门经理审批
	app.get('/work/todo',post_check(['G','Y','G_Y']));
	app.get('/work/todo',work.todo);

	app.get('/work/done',post_check(['G','Y','G_Y']));
	app.get('/work/done',work.done);

	//部门经理审批
	app.get('/monthsmy/check/list',post_check(['Y','G_Y']));
	app.get('/monthsmy/check/list',monthsmy.check_list);

	app.get('/monthsmy/check_one',post_check(['Y','G_Y']));
	app.get('/monthsmy/check_one',monthsmy.check_one);

	app.get('/monthsmy/history/list',post_check(['Y','G_Y']));
	app.get('/monthsmy/history/list',monthsmy.history_list);

	app.get('/monthsmy/history_one',post_check(['Y','G_Y']));
	app.get('/monthsmy/history_one',monthsmy.history_one);

	app.post('/monthsmy/:id/check_next',post_check(['Y','G_Y']));
	app.post('/monthsmy/:id/check_next',monthsmy.check_next);

	app.post('/monthsmy/:id/check_back',post_check(['Y','G_Y']));
	app.post('/monthsmy/:id/check_back',monthsmy.check_back);


	app.get('/monthsmy/:id/check',post_check(['Y','G_Y']));
	app.get('/monthsmy/:id/check',monthsmy.check);

	app.post('/monthsmy/:id/next',post_check(['Y','G_Y']));
	app.post('/monthsmy/:id/next',monthsmy._next);

	app.post('/monthsmy/:id/back',post_check(['Y','G_Y']));
	app.post('/monthsmy/:id/back',monthsmy._back);

	//分管副总审批
	app.get('/monthplan/check/list',post_check(['G','G_Y']));
	app.get('/monthplan/check/list',monthplan.check_list);

	app.get('/monthplan/check_one',post_check(['G','G_Y']));
	app.get('/monthplan/check_one',monthplan.check_one);

	app.get('/monthplan/history/list',post_check(['G','G_Y']));
	app.get('/monthplan/history/list',monthplan.history_list);

	app.get('/monthplan/history_one',post_check(['G','G_Y']));
	app.get('/monthplan/history_one',monthplan.history_one);

	app.post('/monthplan/:id/check_next',post_check(['G','G_Y']));
	app.post('/monthplan/:id/check_next',monthplan.check_next);

	app.post('/monthplan/:id/check_back',post_check(['G','G_Y']));
	app.post('/monthplan/:id/check_back',monthplan.check_back);
	
	app.get('/monthplan/:id/check',post_check(['G','G_Y']));
	app.get('/monthplan/:id/check',monthplan.check);

	app.post('/monthplan/:id/next',post_check(['G','G_Y']));
	app.post('/monthplan/:id/next',monthplan._next);

	app.post('/monthplan/:id/back',post_check(['G','G_Y']));
	app.post('/monthplan/:id/back',monthplan._back);

	app.get('/frame/*',frame);
};

var person_G_Y=conf.person_G_Y;

function is_special_person (person){
	for (var i = person_G_Y.length - 1; i >= 0; i--) {
		if(person_G_Y[i]===person.name){
			return true;
		}
	};
	return false;
}

function get_person_post(person){
	if(is_special_person(person)){
		return "G_Y";
	}
	return person.manage;
}

//职位判断函数
var post_check=function(posts){

	function is_person_post_in_posts(person_post){
		if(!posts) return false;
		for (var i = posts.length - 1; i >= 0; i--) {
			if(person_post===posts[i]){
				return true;
			}
		};
		return false;
	}
	
	return function(req,res,next){
		var person_id=req.query['pa_id'];
		if(!person_id){
			res.send(rt.package(false,'pa_id not found!'));
			return;
		}
	
		var Person=req.models.Person;
		Person.get(person_id,function(err,person){
			if(!person){
				res.send(rt.package(false,'cant find this person by pa_id！'));
				return;
			}
			if(person.state!=='valid'&&person.state!=='invalid'){
				res.send(rt.package(false,'person state is not legal！'));
				return;
			}
			
			var person_post=get_person_post(person);
			if(is_person_post_in_posts(person_post)){
				req.pa.person=person;
				req.pa.person_post=person_post;
				next();
			}else{
				res.send(rt.package(false,'你无权限进行该操作！'));
			}
			
		});
	}
}

