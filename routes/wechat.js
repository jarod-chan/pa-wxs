var wechat = require('node-wechat');

exports.bind=function(app){

	wechat.token = 'pawxs';
	
	app.get("/weixin",function(req,res){
		console.info("weixin method");
		//检验 token
		wechat.checkSignature(req, res);
		//预处理
		wechat.handler(req, res);

		//监听文本信息
		wechat.text(function (data) {

		//console.log(data.ToUserName);
		//console.log(data.FromUserName);
		//console.log(data.CreateTime);
		//console.log(data.MsgType);
		//...

		var msg = {
		  FromUserName : data.ToUserName,
		  ToUserName : data.FromUserName,
		  //MsgType : "music",
		  Title : "宋冬野",
		  Description : "宋冬野——摩登天空7",
		  MusicUrl : "http://zhangmenshiting.baidu.com/data2/music/71272862/44897031226800128.mp3?xcode=1a2d5c8fd915c2383b15453819db7b4dc3b34145ef4199ad",
		  //HQMusicUrl : "http://zhangmenshiting.baidu.com/data2/music/71272862/44897031226800128.mp3?xcode=1a2d5c8fd915c2383b15453819db7b4dc3b34145ef4199ad",
		  //FuncFlag : 0
		}

		//回复信息
			wechat.send(msg);
		});

	});
}
