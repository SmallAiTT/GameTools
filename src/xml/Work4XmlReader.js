/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-10-10
 * Time: 上午12:50
 * To change this template use File | Settings | File Templates.
 */

var xmlReader = require("xmlreader");
var fs = require("fs");

var xmlStr = "<response nn='NN'><whos><who name='A'>a</who><who name='b'>b</who></whos>asdffdas</response>";
xmlReader.read(xmlStr, function(err, res){
    if(null != err) {
        console.log(err);
        return;
    }
    console.log(res);
    console.log(res.response.text());
    console.log(res.response.attributes());
});