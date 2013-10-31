/**
 * @author ghostzhang
 */
var template_conf = {
    key_s: "@",
    key_e: "@",
    remark_s: "<!--",
    remark_t: "::config::",
    remark_e: "-->",
    loop_s: "::loop(?:\\((.*)\\))*::",
    loop_e: "::loop end::",
    cr: air.File.lineEnding
}
var template = function() {
    function file() {
        this.conf = template_conf;
        this.name = "";
        this.path = "";
        this.content = "";
        this.encode = "";
        this.outencode = "";
        this.ext = function() {
            var cont = this.content;
            var loop_reg = this.conf.remark_s + ' *' + this.conf.loop_s + '(?:(.*):{2})?((?:.|\\s)*?)' + this.conf.remark_e + '((?:.|\\s)*?).*' + this.conf.loop_e + ' *' + this.conf.remark_e;
            var loop_patt = new RegExp(loop_reg, "ig");
            var temp_loop = cont.match(loop_patt);
            temp_loop = temp_loop ? temp_loop : [];
            if (temp_loop.length > 0) {
                for (var i = 0; i < temp_loop.length; i++) {
                    var reg = new RegExp(loop_reg, "ig");
                    var l = reg.exec(temp_loop[i]);
                    this.loop_config[this.loop_config.length] = l;
                    cont = cont.replace(l[0], '#loop' + i + '#');
                }
            }
            var patt = new RegExp(this.conf.remark_s + ' *' + this.conf.remark_t + '(?:(.*):{2})?((?:.|\\s)*?)' + this.conf.remark_e, "ig");
            var temp = patt.exec(cont);
            var ch = temp[1] ? temp[1].toLowerCase() : "";
            this.outencode = ch ? ch == "utf8" ? "utf-8" : ch : this.encode;
            var patt2 = new RegExp(this.conf.cr + "*", "g");
            var v = this.config = temp[2].replace(patt2, "");
            for (var i = 0; i < this.config.length; i++) {
                this.config_lists += this.conf.key_s + v[i] + this.conf.key_e + ",";
            }
            var t = temp[0].replace(/\|/g, '\\|').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
            var patt3 = new RegExp('((?:' + this.conf.cr + ')*' + t + '(?:' + this.conf.cr + ')*)', "ig");
            this.newCont = cont.replace(patt3, '');
        };
        this.loop_config = [];
        this.config = "";
        this.config_lists = "";
        this.newCont = "";
        this.resolve = function() {
            var lp = this.loop_config;
            var temp = [
                [],
                []
            ];
            if (lp.length > 0) {
                for (var j = 0; j < lp.length; j++) {
                    var list = [],
                        tmp = [],
                        conf = [];
                    list = lp[j][3].split(";");
                    if (list.length > 1) {
                        var t = [];
                        var re = /[0-9]+.?[0-9]*/g;
                        var loop_title = lp[j][1]; // 说明
                        var loop_db = "";
                        var loop_num = !isNaN(lp[j][2]) ? re.test(lp[j][2]) ? lp[j][2].replace(/.[0-9]+/g, "") : lp[j][2] : 1; // 循环次数
                        for (var i = 0; i < list.length - 1; i++) {
                            var patt = new RegExp(this.conf.key_s + '([A-z]\\w+)' + this.conf.key_e + ':(\\w+)(?: *\\((.*)\\))*(?:\\|(.*))*', "ig");
                            t = patt.exec(list[i]);
                            if (t[2] == 'db') {
                                loop_db = t[4]
                            } else {
                                tmp[tmp.length] = t;
                            }
                        }
                        conf = {
                            loop_db: loop_db,
                            loop_title: loop_title,
                            loop_num: loop_num
                        };
                        temp[0][j] = [conf, tmp];
                    }
                }
            }
            var cont = this.config;
            var list = [];
            list = cont.split(";");
            if (list.length > 0) {
                var t = [];
                for (var i = 0; i < list.length - 1; i++) {
                    var patt = new RegExp(this.conf.key_s + '([A-z]\\w+)' + this.conf.key_e + ':(\\w+)(?: *\\((.*)\\))*(?:\\|(.*))*', "ig");
                    t = patt.exec(list[i]);
                    temp[1][temp[1].length] = t;
                }
            }
            return temp;
        };
    }
    return {
        file: file
    };
}();

function replaceDemo(e) {
    var temp = e.resolve();
    var loop_config = temp[0];
    var config = temp[1];
    var html = e.newCont;
    var num = -1;
    var n = '';
    if (loop_config != "") {
        for (var j = 0; j < loop_config.length; j++) {
            var loop_num = loop_config[j][0].loop_num;
            var loop_html = "";
            for (var k = 0; k < loop_num; k++) {
                var temp_html = e.loop_config[j][4]; // 模板
                for (var i = 0; i < loop_config[j][1].length; i++) {
                    var t = loop_config[j][1][i];
                    if (t != null) {
                        num++;
                        temp_html = getHTML(t, num, temp_html, e);
                    }
                }
                loop_html += temp_html;
            }
            html = html.replace('#loop' + j + '#', loop_html);
        }
    }
    for (var i = 0; i < config.length; i++) {
        var t = config[i];
        num++;
        html = getHTML(t, num, html, e);
    }
    return html;
}

function doSetBox(e) {
    var temp = e.resolve(),
        config = temp[1],
        num = -1,
        html = "",
        db = [],
        loop_config = temp[0];
    if (loop_config != "") {
        for (var j = 0; j < loop_config.length; j++) {
            var loop_num = loop_config[j][0].loop_num,
                loop_title = loop_config[j][0].loop_title,
                loop_db = loop_config[j][0].loop_db,
                title = loop_title != undefined ? +loop_num + '次：' + loop_title : loop_num + '次';
            if (loop_db) {
                db = readDB(loop_db);
            }
            html += '<fieldset class="loop_box"><legend>循环' + title + '</legend>';
            for (var k = 1; k <= loop_num; k++) {
                html += "<p><strong>第 " + k + " 次</strong></p>"
                for (var i = 0; i < loop_config[j][1].length; i++) {
                    var t = loop_config[j][1][i];
                    if (loop_db) {
                        var c = usual_search(db[0], t[1]);
                        if (c >= 0) {
                            var tt = db[k] ? db[k][c] : "";
                            t[4] = tt;
                        }
                    }
                    if (t != null) {
                        num++;
                        html += setHTML(t, num);
                    }
                }
            }
            html += '</fieldset>';
        }
    }
    for (var i = 0; i < config.length; i++) {
        var t = config[i];
        if (t != null) {
            num++;
            html += setHTML(t, num);
        }
    }
    $("#setup-box .inner").html(html);
    html = '<hr /><button class="small orange right" id="bt-copy-file">复制到剪贴板</button>';
    html += '<button class="small orange right" id="bt-save-file">保存文件到桌面</button>';
    $("#op-bar").html(html);
    $("#bt-copy-file").click(function() {
        doCopy();
    });
    $("#bt-save-file").click(function() {
        doSave();
    });
}

function setHTML(t, num) {
    var html = "",
        title = (t[3] != undefined ? t[3] : t[1]),
        value = (t[4] != undefined ? t[4] : ''),
        id = t[2] + num;
    switch (t[2]) {
        case 'date':
            html += '<div class="box">';
            html += '<label for="' + id + '">' + title + '：</label>';
            html += '<input id="' + id + '" type="date" value="' + value + '" />';
            html += '</div>';
            break;
        case 'text':
            html += '<div class="box">';
            html += '<label for="' + id + '">' + title + '：</label>';
            html += '<input id="' + id + '" type="text" value="' + value + '" />';
            html += '</div>';
            break;
        case 'html':
        case 'textarea':
            html += '<div class="box">';
            html += '<label for="' + id + '">' + ((t[3] != undefined && t[3] != "") ? t[3] : t[1]) + '：</label>';
            html += '<textarea id="' + id + '" placeholder="' + ((t[3] != undefined && t[3] != "") ? "请输入" + t[3] : "") + '">' + value + '</textarea>';
            html += '</div>';
            break;
        case 'a':
        case 'link':
            var l = (t[4] != undefined ? t[4].split(',') : '');
            html += '<fieldset class="box"><legend>' + title + '</legend>';
            html += '<label for="' + id + '-txt">链接文本：</label><input id="' + id + '-txt" type="text" value="' + (l[0] != undefined ? l[0] : '') + '" /><br />';
            html += '<label for="' + id + '-link">链接地址：</label><input id="' + id + '-link" type="text" value="' + (l[1] != undefined ? l[1] : '') + '" />';
            html += '<label for="' + id + '-target" class="inline">新窗口打开：</label><input id="' + id + '-target" type="checkbox" ' + (l[2] != undefined ? 'checked="true"' : '') + '" /><br />';
            html += '</fieldset>';
            break;
        default:
            html += '<input id="' + id + '" type="text" value="' + value + '" />';
            break;
    }
    return html;
}

function getHTML(t, num, cont, obj) {
    var html = "";
    var id = '#' + t[2] + num;
    switch (t[2]) {
        case 'date':
        case 'text':
        case 'html':
        case 'textarea':
            var v = $(id).val();
            var n = new RegExp(obj.conf.key_s + t[1] + obj.conf.key_e, "g");
            html = cont.replace(n, v);
            break;
        case 'a':
        case 'link':
            var v1 = $(id + '-txt').val();
            var n = new RegExp(obj.conf.key_s + t[1] + obj.conf.key_e, "g");
            if (v1 != '') {
                var v2 = $(id + '-link').val();
                var v3 = $(id + '-target').is(':checked');
                var v = '<a href="' + (v2 != '' ? v2 : '##') + '"' + (v3 ? ' target="_blank"' : '') + '>' + v1 + '</a>';
                html = cont.replace(n, v);
            } else {
                html = cont.replace(n, '');
            }
            break;
        default:
            var v = $(id).val();
            var n = new RegExp(obj.conf.key_s + t[1] + obj.conf.key_e, "g");
            html = cont.replace(n, v);
            break;
    }
    return html;
}


function readDB(path) {
    try {
        var f = air.File.desktopDirectory.resolvePath(path);
        var fs = new air.FileStream();
        fs.open(f, air.FileMode.READ);
        var byteArr = new air.ByteArray();
        fs.readBytes(byteArr, 0, fs.size);
        var content = transEncodingText(byteArr);
        byteArr.position = 0;
        fs.close();
        return dbTxt(content);
    } catch (error) {
        air.trace(error)
    }
}

function dbTxt(db) {
    var cr = air.File.lineEnding,
        l = db.split(cr);
    for (var i = 0; i < l.length; i++) {
        var nl = l[i].split(/[\t\s]+/);
        l[i] = nl;
    };
    return l;
}

function usual_search(data, key) {
    // 查找关键字，返回下标
    var m = data.length;
    for (var i = 0; i < m; i++) {
        if (data[i] == key) return i;
    }
}