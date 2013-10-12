/**
 * Created with JetBrains WebStorm.
 * User: small
 * Date: 13-10-11
 * Time: 下午5:51
 * To change this template use File | Settings | File Templates.
 */
var fs = require('fs'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser();
fs.readFile(__dirname + '/test.xml', function(err, data) {
    parser.parseString(data, function (err, result) {
        console.dir(result);
        console.log(result.plist.dict);
        console.log('Done');
    });
});