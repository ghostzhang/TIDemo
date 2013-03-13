/**
 * @author ghostzhang
 */
function doTimer(txt, type, time){
    var tempHTML = "";
    if (time == undefined || time < 0) {
        time = 2500;
    }
    switch (type) {
        case "w":
            $("#hint-box").addClass("w");
            break;
        case "s":
            $("#hint-box").addClass("s");
            break;
        default:
            $("#hint-box").addClass("w");
            break;
    }
    $("#hint-box").html(txt);
    if (time > 0) {
        setTimeout(function(){
            $("#hint-box").removeClass("s").removeClass("w").html('');
        }, time);
    }
}

// 选择模板文件
function doBrowseDemo(){
    var filters = new runtime.Array(new air.FileFilter('*.*', '*.*'));
    file.browseForOpen('Select an file', filters);
}

function doSelectDemo(e){
    file_path = file.nativePath;
    readFile(file_path);
}

function transEncodingText(bytes){
    if (bytes[0] == 255 && bytes[1] == 254) {
        demoFile.encode = "unicode";
        return bytes.readMultiByte(bytes.length, "unicode");
    }
    else 
        if (bytes[0] == 98 && bytes[1] == 111) {
            demoFile.encode = "utf-8";
            return bytes.readMultiByte(bytes.length, "utf-8");
        }
        else 
            if (bytes[0] == 254 && bytes[1] == 255) {
                demoFile.encode = "UTF-16BE";
                return bytes.readMultiByte(bytes.length, "UTF-16BE");
            }
            else 
                if (bytes[0] == 239 && bytes[1] == 187) {
                    demoFile.encode = "utf-8";
                    return bytes.readMultiByte(bytes.length, "utf-8");
                }
                else 
                    if (bytes[0] == 64 && bytes[1] == 99) {
                        demoFile.encode = "gb2312";
                        return bytes.readMultiByte(bytes.length, "gb2312");
                    }
                    else {
                        demoFile.encode = air.File.systemCharset;
                    }
    return bytes.readMultiByte(bytes.length, air.File.systemCharset);
}

function readFile(path){
    try {
        var f = air.File.applicationDirectory.resolvePath(path);
        
        var fs = new air.FileStream();
        fs.open(f, air.FileMode.READ);
        demoFile.name = f.name;
        demoFile.path = path;
        var byteArr = new air.ByteArray();
        fs.readBytes(byteArr, 0, fs.size);
        demoFile.content = transEncodingText(byteArr);
        byteArr.position = 0;
        fs.close();
        demoFile.ext();
        doSetBox(demoFile.resolve());
        var txt = '已读取" ' + path + ' ".';
        doTimer(txt, "s");
    } 
    catch (error) {
        air.trace(error)
        var txt = '<span style="color:#D94A0B;">读取" ' + path + ' "失败 !</span>';
        doTimer(txt);
    }
}

function previewDemo(){
    try {
        var note = replaceDemo(demoFile.resolve());
        var temp_file = air.File.createTempFile();
        var stream = new air.FileStream();
        stream.open(temp_file, air.FileMode.WRITE);
        stream.writeMultiByte(note, demoFile.encode);
        var path = 'demo.html';
        var file = air.File.desktopDirectory.resolvePath(path);
        stream.close();
        temp_file.copyTo(file, true);
        return file.nativePath;
    } 
    catch (error) {
    }
}

function doSetBox(e){
    var config = e;
    var num = -1;
    var html = "";
    for (var i = 0; i < config.length; i++) {
        var t = config[i];
        if (t != null) {
            num++;
            switch (t[2]) {
                case 'text':
                    html += '<div class="box">';
                    html += '<label for="' + t[2] + num + '">' + (t[3] != undefined ? t[3] : t[1]) + '：</label>';
                    html += '<input id="' + t[2] + num + '" type="text" value="' + (t[4] != undefined ? t[4] : '') + '" />';
                    html += '</div>';
                    break;
                case 'html':
                case 'textarea':
                    html += '<div class="box">';
                    html += '<label for="' + t[2] + num + '">' + (t[3] != undefined ? t[3] : t[1]) + '：</label>';
                    html += '<textarea id="' + t[2] + num + '" placeholder="Placeholder Text">' + (t[4] != undefined ? t[4] : '') + '</textarea>';
                    html += '</div>';
                    break;
                case 'a':
                case 'link':
                    var l = (t[4] != undefined ? t[4].split(',') : '');
                    html += '<fieldset class="box"><legend>' + (t[3] != undefined ? t[3] : t[1]) + '</legend>';
                    html += '<label for="' + t[2] + num + '-txt">链接文本：</label><input id="' + t[2] + num + '-txt" type="text" value="' + (l[0] != undefined ? l[0] : '') + '" /><br />';
                    html += '<label for="' + t[2] + num + '-link">链接地址：</label><input id="' + t[2] + num + '-link" type="text" value="' + (l[1] != undefined ? l[1] : '') + '" />';
                    html += '<label for="' + t[2] + num + '-target" class="inline">新窗口打开：</label><input id="' + t[2] + num + '-target" type="checkbox" ' + (l[2] != undefined ? 'checked="true"' : '') + '" /><br />';
                    html += '</fieldset>';
                    break;
                default:
                    html += '<input id="' + t[2] + num + '" type="text" value="' + (t[4] != undefined ? t[4] : '') + '" />';
                    break;
            }
        }
    }
    $("#setup-box .inner").html(html);
    html = '<hr /><button class="small green" id="bt-preview">预览</button> ';
    html += '<button class="small orange right" id="bt-save-file">保存文件到桌面</button>';
    $("#op-bar").html(html);
    $("#bt-save-file").click(function(){
        doSave();
    });
    $("#bt-preview").click(function(){
        var url = 'file://' + previewDemo() + '';
        window.open(url, 'demoWindow');
    });
}


function doOver(e){
    for (var t = 0; t < e.dataTransfer.types.length; t++) {
        if (e.dataTransfer.types[t] == 'application/x-vnd.adobe.air.file-list') {
            e.preventDefault();
        }
    }
}

function doDrop(e){
    var files = e.dataTransfer.getData('application/x-vnd.adobe.air.file-list');
    file_path = files[0].nativePath;
    readFile(file_path);
}

function getTime(){
    var today = new Date();
    var m, d;
    m = today.getMonth() + 1;
    if (m < 10) {
        m = "0" + m;
    }
    d = today.getDate();
    if (d < 10) {
        d = "0" + d;
    }
    return today.getFullYear() + "" + m + "" + d + "_" + today.toLocaleTimeString().replace(/:/g, "");
}

function doSave(){
    var note = replaceDemo(demoFile.resolve());
    var name = demoFile.name;
    var temp_file = name.split(".");
    temp_file = temp_file.pop();
    if (note != "") {
        var path = getTime() + '.' + temp_file;
        
        try {
            var file = air.File.desktopDirectory.resolvePath(path);
            
            var stream = new air.FileStream();
            stream.open(file, air.FileMode.WRITE);
            stream.writeMultiByte(note, demoFile.encode);
            stream.close();
            doTimer(path + "成功保存到桌面！", "s");
        } 
        catch (error) {
        }
    }
    else {
        doTimer("模板内容为空", "w");
    }
}

var appMain = function(){
    function onExit(event){
        air.NativeApplication.nativeApplication.icon.bitmaps = [];
        air.NativeApplication.nativeApplication.exit();
    }
    function onMin(event){
        window.nativeWindow.minimize();
    }
    function onHide(event){
        window.nativeWindow.visible = false;
    }
    function onShow(event){
        window.nativeWindow.visible = true;
    }
    function onTop(even){
        var temp = window.nativeWindow.alwaysInFront;
        if (!temp) {
            window.nativeWindow.alwaysInFront = true;
        }
        else {
            window.nativeWindow.alwaysInFront = false;
        }
    }
    function onMove(event){
        window.nativeWindow.startMove();
    }
    function loadApp(){
        $("#bt-open-modefile").click(function(){
            doBrowseDemo();
        });
        var help_txt = $("#setup-box .inner").html();
        $("#bt-open-help").click(function(){
            $("#setup-box .inner").html(help_txt);
            $("#op-bar").html('');
        });
        
        file = air.File.applicationDirectory;
        file.addEventListener(air.Event.SELECT, doSelectDemo);
        
        var parser, xml_obj, root, gAppVersion, gAppName, tempBounds = [];
        //程序信息
        parser = new DOMParser();
        xml_obj = parser.parseFromString(air.NativeApplication.nativeApplication.applicationDescriptor, "text/xml");
        root = xml_obj.getElementsByTagName("application")[0];
        gAppVersion = root.getElementsByTagName("version")[0].firstChild.data;
        gAppName = root.getElementsByTagName("filename")[0].firstChild.data;
        $("#app-title").text(gAppName + " v" + gAppVersion + " | 2012-2013 by CSSForest.org GhostZhang");
        
        //任务栏图标
        if (air.NativeApplication.supportsSystemTrayIcon) {
            var iconLoad, iconMenu, moveable, i, exitCmd = [];
            iconMenu = new air.NativeMenu();
            exitCmd[1] = iconMenu.addItem(new air.NativeMenuItem("检查更新"));
            exitCmd[1].addEventListener(air.Event.SELECT, checkUpdates);
            exitCmd[1] = iconMenu.addItem(new air.NativeMenuItem("退出"));
            exitCmd[1].addEventListener(air.Event.SELECT, onExit);
            iconLoad = new air.Loader();
            iconLoad.contentLoaderInfo.addEventListener(air.Event.COMPLETE, function(event){
                air.NativeApplication.nativeApplication.icon.bitmaps = [event.target.content.bitmapData];
            });
            iconLoad.load(new air.URLRequest("/icons/AIRApp_16.png"));
            air.NativeApplication.nativeApplication.icon.tooltip = "TIDemo";
            air.NativeApplication.nativeApplication.icon.menu = iconMenu;
            air.NativeApplication.nativeApplication.icon.addEventListener("click", function(event){
                air.NativeApplication.nativeApplication.activate();
                window.nativeWindow.activate();
            });
        }
        
        moveable = ["#app-title"];
        for (i = 0; i < moveable.length; i++) {
            $(moveable[i]).mousedown(onMove);
        }
    }
    return {
        loadApp: loadApp,
        onExit: onExit,
        onHide: onHide,
        onTop: onTop
    }
}();
