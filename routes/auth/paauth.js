var rt = require("../common/result.js");

exports.bind=function(req,res){
	res.render('auth/bind');
}

exports.do_auth=function(req,res){
	var username=req.body.username;
	var password=req.body.password;

	var Person=req.models.Person;
	function is_legal(person){
		return person.chkstr===password
		&&(person.state==='valid'||person.state==='invalid');//leave状态人员无法通过验证
	}
	Person.find(
		{or:[{name:username},{email:username},{email:username+"@fyg.cn"}]}
		,function(err, data){
			if(data.length>0){
				var find_pseron=data[0];
				if(is_legal(find_pseron)){
					res.send(rt.package(true,{pa_id:find_pseron.id}));
				}else{
					res.send(rt.package(false));
				}	
			}else{
				res.send(rt.package(false));
			}
		}
	);		
}