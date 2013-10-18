/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-10-10
 * Time: 上午12:50
 * To change this template use File | Settings | File Templates.
 */

var fs = require("fs");
var path = require("path");

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

var ifaceMap = {
    handler : "h_",
    filter : "f_",
    remote : "r_"
};

console.log("|---------------------------------------|");
console.log("|        IfaceGen                       |");
console.log("|        Author: Zheng.Xiaojun          |");
console.log("|        Version: 1.0.0                 |");
console.log("|---------------------------------------|");
console.log("+++++++++++++++++gen starts++++++++++++++");

var serverDires = fs.readdirSync(serverDir);
function readServers(){
    var servers = fs.readdirSync(serverDir);
    for(var i = 0, li = servers.length; i < li; i++){
        var itemi = servers[i];
        readServer(itemi, serverDir);
    }
}
function readServer(server, pathPre){
    var obj = {name : server, ifaces : []};
    servers.push(obj);
    var filePath = path.join(pathPre, server);
    var stat = fs.statSync(filePath);
    if(!stat.isDirectory()){
        return;
    }
    console.log(filePath);
    var files = fs.readdirSync(filePath);
    for(var i = 0, li = files.length; i < li; i++){
        var itemi = files[i];
        console.log(itemi);
        obj.ifaces.push(readServerType(itemi, filePath));
    }
}             //iface.server.h_add
function readServerType(type, serverPath){
    if(!ifaceMap[type]) return;
    var ifaces = [];
    var filePath = path.join(serverPath, type);
    console.log(filePath);
    var stat = fs.statSync(filePath);
    if(!stat.isDirectory()) return;
    var files = fs.readdirSync((filePath));
    for(var i = 0, li = files.length; i < li; i++){
        var itemi = files[i];
        var filePathI = path.join(filePath, itemi);
        var statI = fs.statSync(filePathI);
        if(statI.isDirectory()) continue;
        var content = fs.readFileSync(filePathI).toString();
        var regExp = /((\/\*[\s\S]*?\*\/)|(\/\/.*$))[\s]*proto\.[\w\d_]+[\s]*=[\s]*function/g;
        var results = content.match(regExp);
        if(!results) continue;
        for(var j = 0, lj = results.length; j < lj; j++){
            var itemj = results[j];
            var iface = itemj.match(/\*\/[\s]*proto\.[\w\d_]+[\s]*=[\s]*function/)[0];
            iface = iface.match(/proto\.[\w\d_]+[\s]*=/)[0];
            iface = iface.split("=")[0].trim().substring("proto.".length);
            var obj = {
                desc : itemj.match(/((\/\*[\s\S]*?\*\/)|(\/\/.*$))/)[0],
                iface : path.basename(itemi, ".js") + "_" + iface
            }
            ifaces.push(obj);
        }
    }
    return ifaces;
}
readServers();
var ws = fs.createWriteStream("./iface.js");
ws.write("var iface = {\r\n");
for(var i = 0, li = servers.length; i < li; i++){
    var itemi = servers[i];
    ws.write("    " + itemi.name + " : {\r\n");
    var ifaces = itemi.ifaces;
    for(var j = 0, lj = ifaces.length; j < lj; j++){
        var itemj = ifaces[j];
        for(var k = 0, lk = itemj.length; k < lk; k++){
            var itemk = itemj[k];
            ws.write(itemk.desc + "\r\n");
            ws.write("        " + itemk.iface + " : '" + itemi.name + "." + itemk.iface.replace(/_/g, ".") + "'");
            if(j >= lj - 1 && k >= lk - 1) ws.write("\r\n");
            else ws.write(",\r\n");
        }
    }
    if(i < li - 1) ws.write("    },\r\n");
    else ws.write("    }\r\n");
}
ws.write("};")
ws.end();

console.log(servers[0].ifaces);