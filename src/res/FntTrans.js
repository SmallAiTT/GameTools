/**
 * Created with JetBrains WebStorm.
 * User: small
 * Date: 13-10-16
 * Time: 下午2:54
 * To change this template use File | Settings | File Templates.
 */


var fs = require("fs");
var path = require("path");
var core = require("../core/core.js");

var regExpMap = {
    size : / size=[\d]+ /g,
    spacing : / spacing=[\d]+ /g,
    lineHeight : / lineHeight=[\d]+ /g,
    base : / base=[\d]+ /g,
    scaleW : / scaleW=[\d]+ /g,
    scaleH : / scaleH=[\d]+ /g,

    x : /char .+ x=[\d]+ /g,
    y : /char .+ y=[\d]+ /g,
    width : /char .+ width=[\d]+ /g,
    height : /char .+ height=[\d]+ /g,
    xoffset : /char .+ xoffset=[\d]+ /g,
    yoffset : /char .+ yoffset=[\d]+ /g
};
var toolDir = "../../";
var fntDir = toolDir + "testDir/fnt/";
fntDir = "/Users/small/WebstormProjects/123G/Game/res/";
var outputFntDir = fntDir.substring(0, fntDir.length - 1) + "Trans/";
var factor = 320/480;
var fntTestCfgPath = outputFntDir + "fntTestCfg.js"

var testCfg = {};//{a_fnt : {res : [], args : { fnts : []}}}

function trans(file, filePre){
    file = file || "";
    filePre = filePre || "";
    var filePath = path.join(fntDir, filePre, file);
    if(!fs.existsSync(filePath)){
        console.log("Path:" + filePath + " not exists!");
        return;
    }
    var stat = fs.statSync(filePath);
    if(stat.isFile()){
        if(path.extname(filePath) != ".fnt") return;

        console.log("trans:" + filePath);
        var path1 = require("path");
        var outputDir = path1.join(outputFntDir, filePre);
        if(!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);
        var content = fs.readFileSync(filePath).toString();
        for(var key in regExpMap){
            var matchArr = content.match(regExpMap[key]);
            if(!matchArr) continue;
            for(var j = 0, lj = matchArr.length; j < lj; j++){
                var itemj = matchArr[j];
                var splitStr = key + "=";
                var strArr = itemj.split(splitStr);
                var value = Math.round(parseFloat(strArr[1].trim()) * factor);
                var regExp = new RegExp(itemj);
                console.log(strArr[0] + splitStr + value + " ");
                content = content.replace(regExp, strArr[0] + splitStr + value + " ");
            }
        }
        fs.writeFileSync(path.join(outputDir, file), content);
        var fntImgName = content.match(/ file=".*"/g);
        if(fntImgName != null) {
            fntImgName = fntImgName[0].split("=")[1].trim();
            fntImgName = fntImgName.substring(1, fntImgName.length - 1);
            fntImgName = path.basename(fntImgName);
        }
        if(fntImgName == null || fntImgName == ""){
            fntImgName = path.basename(file, path.extname(file)) + ".png";
        }
        var obj = {res : [], letters : []};
        obj.fnt = "Res." + core.getKeyName(path.basename(file));
        obj.res.push("Res." + core.getKeyName(path.basename(file)));
        obj.res.push("Res." + core.getKeyName(path.basename(fntImgName)));
        var letters = content.match(/ letter=".*"/g);
        if(letters){
            for(var i = 0, li = letters.length; i < li; i++){
                var itemi = letters[i];
                var index = itemi.indexOf("=");//因为内容中可能为等号
                itemi = itemi.substring(index + 1).trim();
                obj.letters.push(itemi);
            }
        }
        testCfg[core.getKeyName(path.basename(file))] = obj;

        return;
    }

    var files = fs.readdirSync(filePath);
    for(var i = 0, li = files.length; i < li; i++){
        var itemi = files[i];
        trans(itemi, path.join(filePre, file));
    }
}

if(!fs.existsSync(outputFntDir)) fs.mkdirSync(outputFntDir);

trans();

var fntTestCfgDir = path.dirname(fntTestCfgPath);
if(!fs.existsSync(fntTestCfgDir)) fs.mkdirSync(fntTestCfgDir);
var ws = fs.createWriteStream(fntTestCfgPath);
ws.write("var FntTestCfg = {\r\n");
for (var key in testCfg) {
    var value = testCfg[key];
    ws.write("    " + key + " : {\r\n");
    ws.write("        fnt : " + value.fnt + ",\r\n");
    var res = value.res;
    var letters = value.letters;
    ws.write("        res : [\r\n");
    for(var i = 0, li = res.length; i < li; i++){
        var itemi = res[i];
        ws.write("            " + itemi);
        if(i < li - 1) ws.write(",");
        ws.write("\r\n");
    }
    ws.write("        ],\r\n");
    ws.write("        letters : [\r\n");
    for(var i = 0, li = letters.length; i < li; i++){
        var itemi = letters[i];
        ws.write("            " + itemi);
        if(i < li - 1) ws.write(",");
        ws.write("\r\n");
    }
    ws.write("        ]\r\n");
    ws.write("    },\r\n");
}
ws.write("};\r\n")
ws.end();