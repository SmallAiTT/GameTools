/**
 * Created with JetBrains WebStorm.
 * User: Administrator
 * Date: 13-10-10
 * Time: 上午12:50
 * To change this template use File | Settings | File Templates.
 */

var fs = require("fs");
var lineReader = require("line-reader");
var factor = 320/480;

var flag = 0;
function mutiV(v, ws){
    var arr = v.split(",");
    for(var i = 0, l = arr.length; i < l; ++i){
        arr[i] = parseFloat(arr[i]) * factor;
    }
    ws.write(arr.join(","));
};
function transRectValue(value, ws){
    ws.write("{{");
    value = value.trim();
    value = value.substring(1, value.length - 1);
    var startIndex = value.indexOf("{");
    var endIndex = value.indexOf("}");
    var v = value.substring(startIndex + 1, endIndex);
    mutiV(v, ws);
    ws.write("},{")
    value = value.substring(endIndex + 1);
    startIndex = value.indexOf("{");
    endIndex = value.indexOf("}");
    v = value.substring(startIndex + 1, endIndex);
    mutiV(v, ws);
    ws.write("}}");
}

function transSopValue(value, ws){
    ws.write("{");
    value = value.trim();
    value = value.substring(1, value.length - 1);
    mutiV(value, ws);
    ws.write("}}");
}
function wrapKey(arr){
    for(var i = 0, l = arr.length; i < l; ++i){
        arr[i] = "<key>" + arr[i] + "</key>";
    }
}
var rectArr = ["frame", "sourceColorRect"];
var sopArr = ["offset", "sourceSize", "size"];
wrapKey(rectArr);
wrapKey(sopArr);

var PlistTrans = function(){
    this.baseDir = "./";

    this._transLine = function(line, ws, func){
        var startIndex = line.indexOf("<string>");
        var endIndex = line.indexOf("</string>");
        var value = line.substring(startIndex + 8, endIndex);
        ws.write(line.substring(0, startIndex + 8));
        if(func) func(value, ws);
        ws.write(line.substring(endIndex));
        ws.write("\r\n");
    };

    this.trans = function(src, target){
        var b = fs.writeFileSync(target, "", "utf-8");//先清空文件内容
        if(b) {
            console.log("output err: " + target);
            return;
        }
        var ws = fs.createWriteStream(target, {flags : 'w', encoding : 'utf-8', mode : 0666});
        var _this = this;
        lineReader.eachLine(src, function(line, last){
            if(flag == 1) _this._transLine(line, ws, transRectValue);
            else if(flag == 2) _this._transLine(line, ws, transSopValue);
            else ws.write(line + "\r\n");

            var matchStr = line.trim();
            if(rectArr.indexOf(matchStr) >= 0) flag = 1;
            else if(sopArr.indexOf(matchStr) >= 0) flag = 2;
            else flag = 0;

            if(last == true){
                ws.end();
            }
        });
    };

    this.transDir = function(srcDir, targetDir){

        console.log("|---------------------------------------|");
        console.log("|        PlistTrans                     |");
        console.log("|        Author: Small                  |");
        console.log("|        Version: 1.0.0                 |");
        console.log("|---------------------------------------|");
        console.log("+++++++++++++++trans starts++++++++++++++");

        var srcDirPath = this.baseDir + srcDir;
        var targetDirPath = this.baseDir + targetDir;
        if(!fs.existsSync(targetDirPath)){
            fs.mkdirSync(targetDirPath);
        }
        var files = fs.readdirSync(srcDirPath);
        for(var i = 0, l = files.length; i < l; ++i){
            var file = files[i];
            if(file.toLowerCase().indexOf(".plist") < 0) continue;
            this.trans(srcDirPath + file, targetDirPath + file);
        }
        console.log("success!");
        console.log("+++++++++++++++trans ends++++++++++++++++");
    };
};

var pt = new PlistTrans();

//If you put this script in your project root, you can ignore this, then the projDir should be "./".
//pt.baseDir = "../../testDir/plistDir/";
//pt.transDir("srcDir/", "targetDir/");

pt.baseDir = "/Users/small/WebstormProjects/123G/Game/res/";
pt.transDir("action/", "action320/");