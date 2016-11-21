/**
 * @author ghostzhang
 * 模板文件
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
var QR = {
    bg: "", //背景颜色  bg=颜色代码，例如：bg=ffffff
    fg: "", //前景颜色  fg=颜色代码，例如：fg=cc0000
    gc: "", //渐变颜色  gc=颜色代码，例如：gc=cc00000
    el: "", //纠错等级  el可用值：h\q\m\l，例如：el=h
    w: "", //尺寸大小   w=数值（像素），例如：w=300
    m: "", //静区（外边距）    m=数值（像素），例如：m=30
    pt: "", //定位点颜色（外框） pt=颜色代码，例如：pt=00ff00
    inpt: "", //定位点颜色（内点）   inpt=颜色代码，例如：inpt=000000
    logo: "", //logo图片  logo=图片地址，例如：logo=http://www.liantu.com/images/2013/sample.jpg
    text: ""
};
var template = function() {
    function file() {
        this.conf = template_conf;
        this.name = "";
        this.path = "";
        this.content = "";
        this.encode = "";
        this.outencode = "";
        this.AUTOSAVE = false;
        this.CONDITION = false; //数据文件筛选开关
        this.CONDITIONdb = null; //循环筛选时的数据文件
        this.savedir = "";
        this.ext = function() {
            // 读取模板文件
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
            var file_config = temp[1] ? temp[1].split("::") : '';
            var ch;
            for (var i = file_config.length - 1; i >= 0; i--) {
                switch (file_config[i].toLowerCase()) {
                    case "utf8":
                    case "utf-8":
                        ch = "utf8"; //读取编码
                        break;
                    case "autosave":
                        this.AUTOSAVE = true; //自动保存文件
                        break;
                    case "condition":
                        this.CONDITION = true;
                        break;
                }
            }

            this.outencode = ch ? ch == "utf8" ? "utf-8" : ch : this.encode;
            var t = temp[0].replace(/\|/g, '\\|').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
            var patt2 = new RegExp(this.conf.cr + "*", "g");
            var v = this.config = temp[2].replace(patt2, "");
            var patt3 = new RegExp('((?:' + this.conf.cr + ')*' + t + '(?:' + this.conf.cr + ')*)', "ig");
            this.newCont = cont.replace(patt3, '');
        };
        this.loop_config = [];
        this.config = "";
        this.newCont = "";
        this.db_condition = [];
        this.resolve = function() {
            var lp = this.loop_config;
            var temp = [
                [],
                []
            ];
            if (lp.length > 0) {
                for (var j = 0; j < lp.length; j++) { // 循环体内设置
                    var list = [],
                        tmp = [],
                        conf = [],
                        db = [];
                    list = lp[j][3].split(";");
                    if (list.length > 1) {
                        var t = [],
                            re = /[0-9]+.?[0-9]*/g,
                            loop_title = lp[j][1], // 说明
                            loop_db = "",
                            __replace__ = "",
                            condition = [],
                            db_condition = false,
                            loop_num = !isNaN(lp[j][2]) ? re.test(lp[j][2]) ? lp[j][2].replace(/\\d+/ig, "") : lp[j][2] : 'auto'; // 循环次数
                        for (var i = 0; i < list.length - 1; i++) {
                            var patt = new RegExp(this.conf.key_s + '([A-z]\\w+)' + this.conf.key_e + ':(\\w+)(?: *\\((.*)\\))*(?:\\|(.*))*', "ig");
                            t = patt.exec(list[i]);
                            switch (t[1].toLocaleUpperCase()) {
                                case "DB":
                                    // 读取数据文件
                                    if (t[2].toLocaleUpperCase() == "SET") {
                                        loop_db = t[4]
                                    } else {
                                        alert("数据库定义格式错误");
                                    }
                                    break;
                                case "IF":
                                    // air.trace(loop_db);
                                    if (t[2].toLocaleUpperCase() == "SET") {
                                        condition = [t[3], t[4]]; // t[3]:变量名；t[4]:值
                                    } else {
                                        alert("设置格式错误");
                                    }
                                    break;
                                case "REPLACE":
                                    // air.trace(t);
                                    if (t[2].toLocaleUpperCase() == "SET") {
                                        var reg = new RegExp('^"(.*)"$', "ig");
                                        if (t[3] && t[4]) {
                                            var nt = reg.exec(t[4]);
                                            switch (t[3].toLocaleUpperCase()) {
                                                case "START":
                                                    __replace__ = '^[\\\r\\\n]*' + nt[1];
                                                    break;
                                                case "END":
                                                    __replace__ = nt[1] + '[\\\r\\\n]*$';
                                                    break;
                                                default:
                                                    __replace__ = '^[\\\r\\\n]*' + nt[1] + '|' + nt[1] + '[\\\r\\\n]*$';
                                            }
                                        }
                                    } else {
                                        alert("设置格式错误");
                                    }
                                    break;
                                case "QR":
                                    if (t[2].toLocaleUpperCase() == "SET") {
                                        // condition = [t[3], t[4]]; // t[3]:变量名；t[4]:值
                                        // air.trace(t)
                                        // air.trace(t[3])
                                        // air.trace(t[4])
                                        var t3 = t[3].split(','),
                                            t4 = t[4].split(',');
                                        QR = _.mapObject(QR, function(val, key) {
                                            for (var i = 0; i < t3.length; i++) {
                                                if (key == t3[i]) {
                                                    return val = t4[i]
                                                }
                                            }
                                        });
                                    } else {
                                        alert("设置格式错误");
                                    }
                                    break;
                                default:
                                    tmp[tmp.length] = t;
                            }
                        }
                        var loop_auto = loop_num == 'auto';
                        if (loop_db) {
                            db = readDB(loop_db);
                            if (db && this.CONDITION) {
                                var CONDITIONdb = fileCondition(db, condition);
                                db_condition = dbFilter(CONDITIONdb, condition);
                            }
                        }
                        if (db_condition) {
                            loop_num = db_condition.length - 1;
                        } else if (db && loop_auto) {
                            loop_num = db.length - 1;
                        }
                        conf = {
                            db: db,
                            db_condition: db_condition,
                            loop_title: loop_title,
                            loop_num: loop_num,
                            __replace__: __replace__
                        };
                        temp[0][j] = [conf, tmp];
                    }
                }
            }
            var cont = this.config;
            // air.trace(cont);
            var list = [];
            list = cont.split(";");
            // air.trace(list);
            if (list.length > 0) {
                var t = [];
                for (var i = 0; i < list.length - 1; i++) {
                    var patt = new RegExp(this.conf.key_s + '([A-z]\\w+)' + this.conf.key_e + ':(\\w+)(?: *\\((.*)\\))*(?:\\|(.*))*', "ig");
                    t = patt.exec(list[i]);
                    // air.trace(t);
                    switch (t[1].toLocaleUpperCase()) {
                        case "SAVEDIR":
                            if (t[2].toLocaleUpperCase() == "SET") {
                                this.savedir = t[4]
                            } else {
                                alert("设置格式错误");
                            }
                            break;
                        case "QR":
                            if (t[2].toLocaleUpperCase() == "SET") {
                                // condition = [t[3], t[4]]; // t[3]:变量名；t[4]:值
                                // air.trace(t)
                                // air.trace(t[3])
                                // air.trace(t[4])
                                var t3 = t[3].split(','),
                                    t4 = t[4].split(',');
                                QR = _.mapObject(QR, function(val, key) {
                                    for (var i = 0; i < t3.length; i++) {
                                        if (key == t3[i]) {
                                            return val = t4[i]
                                        }
                                    }
                                });
                            } else {
                                alert("设置格式错误");
                            }
                            break;
                        default:
                            temp[1][temp[1].length] = t;
                    }
                }
            }
            // air.trace(temp);
            return temp;
        };
    }
    return {
        file: file
    };
}();

function replaceDemo(e) {
    var temp = e.resolve(),
        loop_config = temp[0],
        config = temp[1],
        html = e.newCont,
        num = -1,
        n = '';
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
            var re = new RegExp("" + loop_config[j][0].__replace__ + "", "ig");
            loop_html = loop_html.replace(re, "");
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
    // 生成主界面
    var temp = e.resolve(),
        config = temp[1],
        num = -1,
        html = "",
        loop_config = temp[0];
    if (loop_config != "") {
        for (var j = 0; j < loop_config.length; j++) {
            // air.trace(loop_config[j][0].db_condition);
            var loop_num = loop_config[j][0].loop_num,
                loop_title = loop_config[j][0].loop_title,
                db = loop_config[j][0].db_condition ? loop_config[j][0].db_condition : loop_config[j][0].db;
            // air.trace(db);
            var title = loop_title != undefined ? +loop_num + '次：' + loop_title : loop_num + '次';
            html += '<fieldset class="loop_box"><legend>循环' + title + '</legend>';
            for (var k = 1; k <= loop_num; k++) {
                html += "<p><strong>第 " + k + " 次</strong></p>";
                // if (db[k] = '') continue;
                for (var i = 0; i < loop_config[j][1].length; i++) {
                    var t = loop_config[j][1][i];
                    if (db[k] && db[k].length > 1) {
                        // air.trace(db[0]);
                        var c = usual_search(db[0], t[1]);
                        if (c >= 0) {
                            var tt = db[k][c];
                            // air.trace(k + '=' + tt);
                            t[4] = tt;
                        }
                    } else {
                        var c = usual_search(db[0], t[1]);
                        if (c >= 0) {
                            var tt = '';
                            t[4] = tt;
                        }
                    }
                    if (t) {
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
    html += '<button class="small orange right" id="bt-save-file">保存为文件</button>';
    $("#op-bar").html(html);
    $("#bt-copy-file").click(function() {
        doCopy();
    });
    $("#bt-save-file").click(function() {
        doSave();
    });
}

function setHTML(t, num) {
    // 生成显示用的HTML代码
    var html = "",
        title = (t[3] != undefined ? t[3] : t[1]),
        value = (t[4] != undefined ? t[4] : ''),
        id = t[2] + num;
    switch (t[2].toLocaleUpperCase()) {
        case 'DATE':
            html += '<div class="box">';
            html += '<label for="' + id + '">' + title + '：</label>';
            html += '<input id="' + id + '" type="date" value="' + value + '" />';
            html += '</div>';
            break;
        case 'TEXT':
            html += '<div class="box">';
            html += '<label for="' + id + '">' + title + '：</label>';
            html += '<input id="' + id + '" type="text" value="' + value + '" />';
            html += '</div>';
            break;
        case 'HTML':
        case 'TEXTAREA':
            html += '<div class="box">';
            html += '<label for="' + id + '">' + ((t[3] != undefined && t[3] != "") ? t[3] : t[1]) + '：</label>';
            html += '<textarea id="' + id + '" placeholder="' + ((t[3] != undefined && t[3] != "") ? "请输入" + t[3] : "") + '">' + value + '</textarea>';
            html += '</div>';
            break;
        case 'A':
        case 'LINK':
            var l = (t[4] != undefined ? t[4].split(',') : '');
            html += '<fieldset class="box"><legend>' + title + '</legend>';
            html += '<label for="' + id + '-txt">链接文本：</label><input id="' + id + '-txt" type="text" value="' + (l[0] != undefined ? l[0] : '') + '" /><br />';
            html += '<label for="' + id + '-link">链接地址：</label><input id="' + id + '-link" type="text" value="' + (l[1] != undefined ? l[1] : '') + '" />';
            html += '<label for="' + id + '-target" class="inline">新窗口打开：</label><input id="' + id + '-target" type="checkbox" ' + (l[2] != undefined ? 'checked="true"' : '') + '" /><br />';
            html += '</fieldset>';
            break;
        case 'QR':
            html += '<div class="box">';
            html += '<label for="' + id + '">' + title + '：</label>';
            var qr_url = getQRurl(value);
            html += '<input id="' + id + '" type="text" disabled="disabled" value="' + qr_url + '" />';
            // html += '<img src="' + qr_url + '" />';
            html += '</div>';
            break;
        case 'SET':
            break;
        default:
            html += '<input id="' + id + '" type="text" value="' + value + '" />';
            break;
    }
    return html;
}

function getHTML(t, num, cont, obj) {
    // 取得设置内容
    var html = "";
    var id = '#' + t[2] + num;
    switch (t[2].toLocaleUpperCase()) {
        case 'DATE':
        case 'TEXT':
        case 'HTML':
        case 'TEXTAREA':
        case 'QR':
            var v = $(id).val();
            var n = new RegExp(obj.conf.key_s + t[1] + obj.conf.key_e, "g");
            html = cont.replace(n, v);
            break;
        case 'A':
        case 'LINK':
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

function getQRurl(text) {
    // 取得二维码
    var qrapi = "http://qr.liantu.com/api.php";
    var bg = QR.bg ? "&bg=" + QR.bg : '',
        fg = QR.fg ? "&fg=" + QR.fg : '',
        gc = QR.gc ? "&gc=" + QR.gc : '',
        el = QR.el ? "&el=" + QR.el : '',
        w = QR.w ? "&w=" + QR.w : '',
        m = QR.m ? "&m=" + QR.m : '',
        pt = QR.pt ? "&pt=" + QR.pt : '',
        inpt = QR.inpt ? "&inpt=" + QR.inpt : '',
        logo = QR.logo ? "&logo=" + QR.logo : '';

    return qrapi + "?&text=" + text.replace(/\&/g, '%26').replace(/\r/g, '%0A') + bg + fg + gc + el + w + m + pt + inpt + logo;
}

function readDB(path) {
    // 读取数据文件
    path = getFilePath(demoFile.path) + path;
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
        return false;
    }
}

function dbTxt(db) {
    // 整理数据，生成索引
    var cr = air.File.lineEnding,
        l = db.split(cr),
        _db = [];
    for (var i = 0; i < l.length; i++) {
        if (l[i] != '') {
            var nl = l[i].split(/[\t]+/);
            _db.push(nl);
        } else {
            continue;
        }
    };
    return _db;
}

function usual_search(data, key) {
    // 查找关键字，返回下标
    var m = data.length;
    for (var i = 0; i < m; i++) {
        if (data[i] === key) {
            return i
        };
    }
}

function getFilePath(path) {
    // 取得数据文件位置
    var pathType = air.File.separator;
    if (path.substr(0, 4) != "http") {
        var temp_path = path.split(pathType);
        temp_path.pop();
        var temp_filePath = temp_path.join(pathType);
        return temp_filePath + pathType;
    } else {
        return air.File.desktopDirectory.nativePath + pathType;
    }
}

function dbFilter(db, v) {
    // 以关键字筛选出数据
    var V = v[0],
        N = v[1];
    for (var i = 0; i < db.length; i++) {
        if (db[i][0] == N) {
            return db[i][1];
        }
    };
    return false;
}

function fileCondition(db, v) {
    // 以关键字索引生成新的索引
    var len = db.length,
        _v = [],
        _db = [],
        c = '',
        L = v[0],
        newdb = [];
    c = _.indexOf(db[0], L);
    // air.trace(c);
    if (c > -1) {
        for (var i = 1; i <= len; i++) {
            if (db[i]) {
                _db.push(db[i][c])
            }
        };
        // air.trace(_db);
        _v = _.uniq(_db); // 关键字索引
        // air.trace(_v);
        _db = db;
        for (var i = 0; i < _v.length; i++) {
            var newlist = [];
            newlist[0] = [_v[i]];
            newlist[1] = [db[0]];
            for (var j = 1; j <= len; j++) {
                if (_db[j] && _v[i] == _db[j][c]) {
                    newlist[1].push(_db[j]);
                }
            };
            newdb[i] = newlist;
            // air.trace(newdb[i] + "\t")
        };
    }
    return newdb;
}
