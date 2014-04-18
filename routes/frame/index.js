var frame_len="frame".length+1;

module.exports=function(req,res){
	var frame_url=req.originalUrl.substring(frame_len)
	res.render("frame",{frame_url:frame_url});
}