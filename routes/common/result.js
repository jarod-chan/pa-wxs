
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

That.prototype.append=function(arg2){
	if(!arg2) return this;
	this.message=arg2;
	return this;
}

exports.package=function(flag,arg,arg2){
	var that=new That();
	return that.flag(flag).set(arg).append(arg2);
}