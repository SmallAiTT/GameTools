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
        arr[i] = Math.round(parseFloat(arr[i]) * factor);
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
    ws.write("}");
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

    this.trans = function(gFiles, gCurrIndex){
        var file = "";
        while(file.trim().indexOf(".plist") < 0 && gCurrIndex < gFiles.length){
            file = gFiles[gCurrIndex++];
        }
        if(gCurrIndex >= gFiles.length){
            console.log("success!");
            console.log("+++++++++++++++trans ends++++++++++++++++");
            return;
        }
        var src = this._srcDir + file;
        console.log("trans-->" + src);
        var target = this._targetDir + file;
        var b = fs.writeFileSync(target, "", "utf-8");//先清空文件内容
        if(b) {
            console.log("output err: " + target);
            return;
        }
        var ws = fs.createWriteStream(target, {flags : 'w', encoding : 'utf-8', mode : 0666});
        var _this = this;
        // read all lines:
        lineReader.eachLine(src, function(line) {
//            console.log(line);
            if(flag == 1) _this._transLine(line, ws, transRectValue);
            else if(flag == 2) _this._transLine(line, ws, transSopValue);
            else ws.write(line + "\r\n");

            var matchStr = line.trim();
            if(rectArr.indexOf(matchStr) >= 0) flag = 1;
            else if(sopArr.indexOf(matchStr) >= 0) flag = 2;
            else flag = 0;
        }).then(function () {
                ws.end();
                _this.trans(gFiles, gCurrIndex);
            });
//        lineReader.open(src, function(reader){
//            while (reader.hasNextLine()) {
//                reader.nextLine(function(line) {
//                    console.log(line);
//                    if(flag == 1) _this._transLine(line, ws, transRectValue);
//                    else if(flag == 2) _this._transLine(line, ws, transSopValue);
//                    else ws.write(line + "\r\n");
//
//                    var matchStr = line.trim();
//                    if(rectArr.indexOf(matchStr) >= 0) flag = 1;
//                    else if(sopArr.indexOf(matchStr) >= 0) flag = 2;
//                    else flag = 0;
//                });
//            }
//        });
/*        lineReader.eachLine(src, function(line, last){
            if(flag == 1) _this._transLine(line, ws, transRectValue);
            else if(flag == 2) _this._transLine(line, ws, transSopValue);
            else ws.write(line + "\r\n");

            var matchStr = line.trim();
            if(rectArr.indexOf(matchStr) >= 0) flag = 1;
            else if(sopArr.indexOf(matchStr) >= 0) flag = 2;
            else flag = 0;

            if(last == true){
                console.log("file write end!");
                ws.end();
                return false;
            }
        });*/
    };

    this.transDir = function(srcDir, targetDir){

        console.log("|---------------------------------------|");
        console.log("|        PlistTrans                     |");
        console.log("|        Author: Small                  |");
        console.log("|        Version: 1.0.0                 |");
        console.log("|---------------------------------------|");
        console.log("+++++++++++++++trans starts++++++++++++++");

        this._srcDir = this.baseDir + srcDir;
        this._targetDir = this.baseDir + targetDir;
        if(!fs.existsSync(this._targetDir)){
            fs.mkdirSync(this._targetDir);
        }
        var files = fs.readdirSync(this._srcDir);
        this.trans(files, 0);
    };
};

var pt = new PlistTrans();

//If you put this script in your project root, you can ignore this, then the projDir should be "./".
//pt.baseDir = "../../testDir/plistDir/";
//pt.transDir("srcDir/", "targetDir/");

pt.baseDir = "/Users/small/WebstormProjects/123G/Game/res/";
pt.transDir("action/", "action320/");