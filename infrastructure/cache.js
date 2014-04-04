var info=require("./info");

var cache_map={}

function get(pa_id){
	var key=pa_id.toString();
	var saved_info=cache_map[key];
	if(!saved_info){
		saved_info=info.create();
		cache_map[key]=saved_info;
	}
	return saved_info; 
}


module.exports = function() {
  return function(req, res, next) {
    if (!req.query.pa_id) { return next(); }
    req.cache_pa=get(req.query.pa_id);
    next();
  }
}