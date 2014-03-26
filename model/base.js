
exports.bind=function (db,models){	
	//人员
	models.Person =db.define("fyperson", {
		id: Number,
		name: String,
		email: String,
		chkstr:String,
		manage:['A','G','Y','N'], // A-管理员 G-分管副总 Y-部门经理 N-普通员工
		department:String,
		state:['valid','invalid','leave'] //valid-有效 invalid-返聘  leave-离职
	});
	
	//部门
	models.Department=db.define("department",{
		id:Number,
		name:String,
		number:String,
		gmange_id:Number
	});

}

