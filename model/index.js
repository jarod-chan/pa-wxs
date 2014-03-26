var md_base=require("./base")
	,md_monthplan=require("./monthplan")
	,md_monthsmy=require("./monthsmy");

module.exports = function(db,models) {
	md_base.bind(db,models);
	md_monthplan.bind(db,models);
	md_monthsmy.bind(db,models);
};