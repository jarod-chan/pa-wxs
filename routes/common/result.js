
function That(){
	this.result=true;
}

That.prototype.flag=function(flag){
	this.result=flag;
	return this;
}

That.prototype.set=function(arg){
	if(!arg){return this;}
	if(this.result){
		this.data=arg;
	}else{
		this.message=arg;
	}
	return this;	
}

exports.package=function(flag,arg){
	var that=new That();
	return that.flag(flag).set(arg);
}