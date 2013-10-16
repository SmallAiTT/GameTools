/**
 * Created with JetBrains WebStorm.
 * User: small
 * Date: 13-10-16
 * Time: 下午4:15
 * To change this template use File | Settings | File Templates.
 */

var core = {};
core.getKeyName = function(name){
    var key = name.replace(/[.]/g, "_");
    key = key.replace(/[\-]/g, "_");
    var r = key.match(/^[0-9]/);
    if(r != null) key = "_" + key;
    return key;
};
module.exports = core;