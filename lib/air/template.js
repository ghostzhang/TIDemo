/**
 * @author ghostzhang
 */
var template_conf = {
    key_s: "@",
    key_e: "@",
    remark_s: "<!--",
    remark_t: "::config::",
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
        this.outencode = "";
        this.ext = function(){
            var cont = this.content;
            var patt = new RegExp(this.conf.remark_s + ' *' + this.conf.remark_t + '(?:(.*):{2})?((?:.|\\s)*?)' + this.conf.remark_e, "g");
            var temp = patt.exec(cont);
            var ch = temp[1]?temp[1].toLowerCase():"";
            this.outencode = ch?ch=="utf8"?"utf-8":ch:this.encode;
            var patt2 = new RegExp(this.conf.cr + "*", "g");
            var v = this.config = temp[2].replace(patt2, "");
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


function replaceDemo(e){
    var config = e;
    var num = -1;
    var html = demoFile.newCont;
    var n = '';
    for (var i = 0; i < config.length; i++) {
        var t = config[i];
        num++;
        switch (t[2]) {
            case 'text':
            case 'html':
            case 'textarea':
                var v = $('#' + t[2] + num).val();
                v = v.replace(demoFile.conf.key_s, '').replace(demoFile.conf.key_e, '');
                var n = new RegExp(demoFile.conf.key_s + t[1] + demoFile.conf.key_e,"g");
                html = html.replace(n, v);
                break;
            case 'a':
            case 'link':
                var v1 = $('#' + t[2] + num + '-txt').val();
                var n = new RegExp(demoFile.conf.key_s + t[1] + demoFile.conf.key_e,"g");
                if (v1 != '') {
                    var v2 = $('#' + t[2] + num + '-link').val();
                    var v3 = $('#' + t[2] + num + '-target').is(':checked');
                    var v = '<a href="' + (v2 != '' ? v2 : '##') + '"' + (v3 ? ' target="_blank"' : '') + '>' + v1 + '</a>';
                    v = v.replace(demoFile.conf.key_s, '').replace(demoFile.conf.key_e, '');
                    html = html.replace(n, v);
                }
                else {
                    html = html.replace(n, '');
                }
                break;
            default:
                default_statement;
        }
    }
    return html;
}