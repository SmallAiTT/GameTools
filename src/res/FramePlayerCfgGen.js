/**
 * Created with JetBrains WebStorm.
 * User: small
 * Date: 13-10-11
 * Time: 下午5:38
 * To change this template use File | Settings | File Templates.
 */

var fs = require('fs'),
    xml2js = require('xml2js');

var parser = new xml2js.Parser();
//fs.readFile(__dirname + '/test.xml', function(err, data) {
//    parser.parseString(data, function (err, result) {
//        console.dir(result);
//        console.log(result.plist.dict);
//        console.log('Done');
//    });
//});


function FramePlayerCfgGen(){
    this.baseDir = "./";

    this._resArr = [];
    this._showArr = [];
    this._cfgFile = "";

    this._genFile = function(){
        var b = fs.writeFileSync(this._cfgFile, "", "utf-8");//先清空文件内容
        if(b) {
            console.log("output err: " + this._cfgFile);
            return;
        }
        var ws = fs.createWriteStream(this._cfgFile, {flags : 'w', encoding : 'utf-8', mode : 0666});

        ws.write("var fpCfg = {\r\n");

        ws.write("    res : [\r\n");
        for(var i = 0, l = this._resArr.length; i < l; ++i){
            ws.write("        " + this._resArr[i]);
            if(i < l - 1) ws.write(",");
            ws.write("\r\n");
        }
        ws.write("    ],")

        ws.write("    shows : [\r\n")
        for(var i = 0, l = this._showArr.length; i < l; ++i){
            var show = this._showArr[i];
            ws.write("        {\r\n");
            ws.write("            plist : " + show.plist + ",\r\n");
            ws.write("            frames : [\r\n");
            for(var j = 0, l1 = show.frames.length; j < l1; ++j){
                ws.write("                '" + show.frames[j] + "'");
                if(j < l1 - 1) ws.write(",");
                ws.write("\r\n");
            }
            ws.write("            ]\r\n");
            ws.write("        }");
            if(i < l - 1) ws.write(",");
            ws.write("\r\n");
        }
        ws.write("    ]\r\n");

        ws.write("};")
        ws.end();
    };

    this.gen = function(gFiles, gCurrIndex){
        var file = "";
        while(file.trim().indexOf(".plist") < 0 && gCurrIndex < gFiles.length){
            file = gFiles[gCurrIndex++];
        }
        if(gCurrIndex >= gFiles.length){
            console.log("success!");
            console.log("+++++++++++++++gen ends++++++++++++++++++");
            this._genFile();
            return;
        }
        var src = this._srcDir + file;
        console.log("parse-->" + src);
        var _this = this;

        var plistName = file.replace(/[.]/g, "_");
        plistName = plistName.replace(/[\-]/g, "_");
        var r = plistName.match(/^[0-9]/);
        if(r != null) plistName = "_" + plistName;
        plistName = "Res." + plistName;
        var pngName = plistName.substring(0, plistName.length - 6) + "_png";
        this._resArr.push(plistName);
        this._resArr.push(pngName);

        fs.readFile(src, function(err, data) {
            parser.parseString(data, function (err, result) {
//                console.dir(result);
                var dict = result.plist.dict[0];
                var keyArr = dict.key;
                var dictChildren = dict.dict;
                var show = {plist : plistName, frames : []};
                for(var i = 0, l = keyArr.length; i < l; ++i){
                    if(keyArr[i] != "frames") continue;
                    show.frames.push(dictChildren[i].key[0]);
//                    ws.write();
                }
                _this._showArr.push(show);
                console.log('Done');

                _this.gen(gFiles, gCurrIndex++);
            });
        });
    }

    this.genDir = function(srcDir, cfgFile){

        console.log("|---------------------------------------|");
        console.log("|        PlistTrans                     |");
        console.log("|        Author: Small                  |");
        console.log("|        Version: 1.0.0                 |");
        console.log("|---------------------------------------|");
        console.log("+++++++++++++++gen starts++++++++++++++++");

        this._cfgFile = cfgFile;
        this._srcDir = this.baseDir + srcDir;
        var files = fs.readdirSync(this._srcDir);
        this.gen(files, 0);
    };
}

var cfgGen = new FramePlayerCfgGen();
cfgGen.genDir("../xml/", "testCfg.js");