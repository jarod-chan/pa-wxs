

exports.bind=function(app){
	
	app.get("/bind",function(req,res){
		res.render('binder/bind');
	});

	app.post("/auth",function(req,res){
		var username=req.body.username;
		var password=req.body.password;
		console.info(username);
		console.info(password);

		var Person=req.models.Person;
		Person.find({or:[{name:username},{email:username},{email:username+"@fyg.cn"}]},function(err, data){
			if(data.length>0){
				var find_pseron=data[0];
				if(find_pseron.chkstr===password&&(find_pseron.manage==='G'||find_pseron.manage==='Y')){//分管副总开发绑定功能
					res.send({
						result:true,
						pa_id:find_pseron.id
					});
				}else{
					res.send({result:false});
				}
			}else{
				res.send({result:false});
			}
		});

		
	});

}
