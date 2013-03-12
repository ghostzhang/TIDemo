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

function replaceDemo(e){
    var config = e;
    var num = -1;
    var html = demoFile.newCont;
    var n = '';
    for (var i = 0; i < config.length; i++) {
        var t = config[i];
        var temp_lists = [];
        num++;
        switch (t[2]) {
            case 'text':
            case 'html':
            case 'textarea':
                var v = $('#' + t[2] + num).val();
                var n = demoFile.conf.key_s + t[1] + demoFile.conf.key_e;
                var patt = new RegExp(n, "g");
                if (v.search(n) > 0) {
                    v = v.replace(patt, '');
                }
                for (var i = demoFile.config_lists.length - 1; i >= 0; i--) {
                    if (v.search(demoFile.config_lists[i]) > 0) {
                        temp_lists[temp_lists.length][0] = demoFile.conf.key_s + t[1] + temp_lists.length + demoFile.conf.key_e;
                        temp_lists[temp_lists.length][1] = ;
                    }
                }
                html = html.replace(patt, v);
                break;
            case 'a':
            case 'link':
                var v1 = $('#' + t[2] + num + '-txt').val();
                var n = demoFile.conf.key_s + t[1] + demoFile.conf.key_e;
                var patt = new RegExp(n, "g");
                if (v1 != '') {
                    var v2 = $('#' + t[2] + num + '-link').val();
                    var v3 = $('#' + t[2] + num + '-target').is(':checked');
                    var v = '<a href="' + (v2 != '' ? v2 : '##') + '"' + (v3 ? ' target="_blank"' : '') + '>' + v1 + '</a>';
                    if (v1.search(n) > 0) {
                        v = v.replace(patt, '');
                    }
                    html = html.replace(patt, v);
                }
                else {
                    html = html.replace(patt, '');
                }
                break;
            default:
                default_statement;
        }
    }
    return html;
}
