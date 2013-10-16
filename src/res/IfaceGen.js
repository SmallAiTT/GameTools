/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-10-10
 * Time: 上午12:50
 * To change this template use File | Settings | File Templates.
 */

var fs = require("fs");
var lineReader = null;
try{
    lineReader = require("line-reader");
}catch(e){
    console.log(e);
    console.log("If you are using command line, please exec command first:")
    console.log("npm install line-reader -g.");
    console.log("Or add 'line-reader':'*' into your package.json .");
    console.log("npm install line-reader -g can not work while run with Webstorm");
    return;
}

var servers = [];
var toolDir = "../../"
var serverDir = toolDir + "testDir/game-server/app/servers/";
var outputPath = "";

console.log("|---------------------------------------|");
console.log("|        IfaceGen                       |");
console.log("|        Author: Zheng.Xiaojun          |");
console.log("|        Version: 1.0.0                 |");
console.log("|---------------------------------------|");
console.log("+++++++++++++++++gen starts++++++++++++++");

var serverDires = fs.readdirSync(serverDir);
function readServers(){
    var gServers = fs.readdirSync(serverDir);
    var gSIndex = 0;
    var pathPre = serverDir;
    console.log(gServers);
    readServer(gServers, gSIndex, pathPre);
}
function readServer(gServers, gSIndex, pathPre){
    if(gServers.length <= gSIndex){
        return callEnd();
    }
    var filePath = pathPre + gServers[gSIndex];
    var stat = fs.statSync(filePath);
    if(!stat.isDirectory()){
        return readServer(gServers, gSIndex + 1, pathPre);
    }
    console.log(filePath);
    readServer(gServers, gSIndex + 1, pathPre);
}
function callEnd(){
    console.log("Success");
    console.log("+++++++++++++++++gen ends++++++++++++++++");
}
readServers();