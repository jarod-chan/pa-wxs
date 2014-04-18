document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
	WeixinJSBridge.call('closeWindow');
});


1、隐藏微信网页右上角的按钮
document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
    // 通过下面这个API隐藏右上角按钮
    WeixinJSBridge.call('hideOptionMenu');
});
            
document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
    // 通过下面这个API显示右上角按钮
    WeixinJSBridge.call('showOptionMenu');
});
2、隐藏微信网页底部的导航栏
document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
    // 通过下面这个API隐藏底部导航栏
    WeixinJSBridge.call('hideToolbar');
});
           
document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
    // 通过下面这个API显示底部导航栏
    WeixinJSBridge.call('showToolbar');
});
3、在微信网页中获取用户的网络状态
WeixinJSBridge.invoke('getNetworkType',{},function(e){
    // 在这里拿到e.err_msg，这里面就包含了所有的网络类型
    alert(e.err_msg);
});
e.err_msg的取值如下所示：
network_type:wifi         wifi网络
network_type:edge      非wifi,包含3G/2G
network_type:fail         网络断开连接
network_type:wwan     2g或者3g


  WeixinJSBridge.on('menu:button:back', function(argv){ alert("发送给好友"); });