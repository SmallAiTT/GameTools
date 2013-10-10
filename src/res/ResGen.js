/**
 * 将该文件放在项目根目录中，用nodejs运行该文件生成Res.js文件。
 * 目录结构为：
 * +Proj
 * 		+res
 * 		+src
 * 		+test
 * 		+cfg
 *
 * dirCfgList配置成："res->res/", "src", "test", "../tt/src->../tt/"]。
 * 其中，"res->res/"的意思是，获取到的res目录底下的路径会去除掉res目录之前，
 * 例如原来是./res/a.png，获取到的结果为a.png。
 * 不写默认从"./"截断。
 * outputPath默认为"./cfg/Res.js"。
 */



/**
 * the class of Resource Generator.
 * @param {Array} dirCfgList  		dir config list
 * @param {String} outputPath 	the output file path
 */
var ResGen = function(dirCfgList, outputPath){
	var _dirCfgList = dirCfgList || [];
	var _outputPath = outputPath || "cfg/Res.js";

	var _fs = require("fs");
	var _resArr = [];
	var _resKeyArr = [];

	var _fileTypeArr = [
		"png", "jpg", "bmp", "jpeg", "gif", "mp3", "ogg", "wav", "mp4", "plist",
		"xml", "fnt", "tmx", "tsx", "ccbi", "font", "txt", "vsh", "fsh", "json", "js"
	];

    this.projDir = "../";

	this._walkDir = function(dir, pre){
		if(!_fs.existsSync(dir)) {
            console.log(dir + "    not exists!")
            return;
        }
		stats = _fs.statSync(dir);
		if(!stats.isDirectory()) {
            console.log(dir + "    is not a directory!")
            return;
        }
		var dirList = _fs.readdirSync(dir);
		for(var i = 0, l = dirList.length; i < l; ++i){
			var item = dirList[i];
			var path = dir + "/" + item;
			if(_fs.statSync(path).isDirectory())
				this._walkDir(path, pre);
			else{
				var index = item.lastIndexOf(".");
				if(index < 0) continue;
				var type = item.substring(index + 1).toLowerCase();
				if(_fileTypeArr.indexOf(type) < 0) continue;//如果不是所需类型，则跳过
				// console.log(type + "   " + item);
				_resArr.push(path.substring(pre.length));
				var key = item.replace(/[.]/g, "_");
				key = key.replace(/[\-]/g, "_");
                var r = key.match(/^[0-9]/);
                if(r != null) key = "_" + key;
				_resKeyArr.push(key);
			}		
		}
	};

	this.gen = function(){
		console.log("|---------------------------------------|");
		console.log("|        ResGen                         |");
		console.log("|        Author: Small                  |");
		console.log("|        Version: 1.0.0                 |");
		console.log("|---------------------------------------|");
		console.log("+++++++++++++++gen starts++++++++++++++++");
		for(var i = 0, l = _dirCfgList.length; i < l; ++i){
			var cfg = _dirCfgList[i];
			var dir = cfg, pre = "";
			var strs = cfg.split("->");
			if(strs.length == 2){
				dir = strs[0];
				pre = strs[1];
			}
			this._walkDir(this.projDir + dir, this.projDir + pre);
		}

        var outputPath = this.projDir + _outputPath;
        if(!_fs.existsSync(outputPath)){
            console.log(outputPath + "    not exists!");
            return;
        }
		var b = _fs.writeFileSync(outputPath, "", "utf-8");//先清空文件内容
		if(b) {
			console.log("output err: " + outputPath);
		}else{
			var wOption = {
			  flags: 'a',
			  encoding: null,
			  mode: 0666   
			}
			var fws = _fs.createWriteStream(outputPath,wOption);
			fws.write("var Res = {\r\n");
			for(var i = 0, l = _resArr.length; i < l; ++i){
				fws.write("    " + _resKeyArr[i] + " : '" + _resArr[i] + "'");
				if(i < l - 1) fws.write(",");
				fws.write("\r\n");
			}
			fws.write("};");
			fws.end();
		}
		_resArr = [];
		_resKeyArr = [];
		console.log("success!")
		console.log("+++++++++++++++gen ends++++++++++++++++++");
	};
};

//Config your resources directorys here.
var resGen = new ResGen(["res->res/", "src", "test", "../tt/src->../tt/"]);

//If you put this script in your project root, you can ignore this, then the projDir should be "./".
resGen.projDir = "../../testDir/Proj/";

resGen.gen();
