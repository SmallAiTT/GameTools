module.exports = function(app) {
	return new TestHandler(app);
};
var TestHandler = function(app) {
		this.app = app;
};
var proto = TestHandler.prototype;

/**
 * 这是接口描述。
 * @iface add
 * @param msg
 * @param session
 * @param next
 */
proto.add = function(msg, session, next){
    //TODO add your biz code here.
};