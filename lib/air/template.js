/**
 * @author ghostzhang
 */
var template_conf = {
    key_s: "@",
    key_e: "@",
    remark_s: "<!-- ::config::",
    remark_e: "-->",
    cr: air.File.lineEnding
}
var template = function(){
    function file(){
        this.conf = template_conf;
        this.name = "";
        this.path = "";
        this.content = "";
        this.encode = "";
        this.ext = function(){
            var cont = this.content;
            var patt = new RegExp(this.conf.remark_s + '((?:.|\\s)*?)' + this.conf.remark_e, "g");
            var temp = patt.exec(cont);
            var patt2 = new RegExp(this.conf.cr + "*", "g");
            var v = this.config = temp[1].replace(patt2, "");
            for (var i = 0; i < this.config.length; i++) {
                this.config_lists += this.conf.key_s + v[i] + this.conf.key_e + ",";
            }
            var t = temp[0].replace(/\|/g, '\\|').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
            var patt3 = new RegExp('((?:' + this.conf.cr + ')*' + t + '(?:' + this.conf.cr + ')*)', "g");
            this.newCont = cont.replace(patt3, '');
        };
        this.config = "";
        this.config_lists = "";
        this.newCont = "";
        this.resolve = function(){
            var cont = this.config;
            var list = [];
            list = cont.split(";");
            var temp = [];
            if (list.length > 0) {
                var t = [];
                for (var i = 0; i < list.length - 1; i++) {
                    var patt = new RegExp(this.conf.key_s + '([A-z]\\w+)' + this.conf.key_e + ':(\\w+)(?: *\\((.*)\\))*(?:\\|(.*))*', "g");
                    t = patt.exec(list[i]);
                    temp[temp.length] = t;
                }
            }
            return temp;
        };
    }
    return {
        file: file
    };
}();
var demoFile = new template.file();