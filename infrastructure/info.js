var info=function(){
	this.data=null;
}

info.prototype.msg=function(data){
	if(!data){
		var ret=this.data;
		this.data=null;
		return ret;
	}else{		
		this.data=data;
	}
}

exports.create=function(){
	return new info();
}


