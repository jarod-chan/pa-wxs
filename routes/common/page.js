
function That(){
	this.size=10;
	
	this.query_num=this.size+1;
	this.begin_num=0;
	this.ret={};
}

That.prototype.numb=function(pagenumb){
	var numb=1;
	if(pagenumb&&Number(pagenumb)>0){
		numb=Number(pagenumb);
	}

	this.begin_num=(numb-1)*this.size;
	this.ret.prev=numb-1;
	this.ret.curr=numb;
	this.ret.next=numb+1;
}

That.prototype.data=function(data){
	if(data.length<this.query_num){
		this.ret.next=0;//说明本页是最后一页
		return data;
	}
	return data.slice(0,this.size);
}


module.exports=function(numb){
	var that=new That();
	that.numb(numb);
	return that;	
}




