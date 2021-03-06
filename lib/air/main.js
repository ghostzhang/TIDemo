/**
 * @author ghostzhang
 */

var demoFile = null,
    file_path = "";

function doTimer(txt, type, time) {
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
        setTimeout(function() {
            $("#hint-box").removeClass("s").removeClass("w").html('');
        }, time);
    }
}

// 选择模板文件

function doBrowseDemo() {
    demoFile = null;
    demoFile = new template.file();
    var filters = new runtime.Array(new air.FileFilter('*.*', '*.*'));
    file.browseForOpen('Select an file', filters);
}

function doSelectDemo(e) {
    file_path = file.nativePath;
    readFile(file_path);
}

function transEncodingText(bytes) {
    if (bytes[0] == 255 && bytes[1] == 254) {
        demoFile.encode = "unicode";
        return bytes.readMultiByte(bytes.length, "unicode");
    }
    if (bytes[0] == 98 && bytes[1] == 111) {
        demoFile.encode = "utf-8";
        return bytes.readMultiByte(bytes.length, "utf-8");
    }
    if (bytes[0] == 254 && bytes[1] == 255) {
        demoFile.encode = "UTF-16BE";
        return bytes.readMultiByte(bytes.length, "UTF-16BE");
    }
    if (bytes[0] == 239 && bytes[1] == 187) {
        demoFile.encode = "utf-8";
        bytes.position = 3;
        return bytes.readMultiByte(bytes.length - 3, "utf-8");
    }
    demoFile.encode = air.File.systemCharset;
    return bytes.readMultiByte(bytes.length, air.File.systemCharset);
}

function readFile(path) {
    demoFile = null;
    demoFile = new template.file();
    var nDF = null;
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
        doSetBox(demoFile);
        var txt = '已读取" ' + path + ' ".';
        $("#outencode").html("输出编码：" + demoFile.outencode);
        doTimer(txt, "s");
        if (demoFile.AUTOSAVE) {
            doSave();
        }
    } catch (error) {
        air.trace(error)
        var txt = '<span style="color:#D94A0B;">读取" ' + path + ' "失败 !</span>';
        doTimer(txt);
    }
}

function doOver(e) {
    for (var t = 0; t < e.dataTransfer.types.length; t++) {
        if (e.dataTransfer.types[t] == 'application/x-vnd.adobe.air.file-list') {
            e.preventDefault();
        }
    }
}

function doDrop(e) {
    var files = e.dataTransfer.getData('application/x-vnd.adobe.air.file-list');
    file_path = files[0].nativePath;
    readFile(file_path);
}

// function getTime() {
//     var today = new Date();
//     var m, d;
//     m = today.getMonth() + 1;
//     if (m < 10) {
//         m = "0" + m;
//     }
//     d = today.getDate();
//     if (d < 10) {
//         d = "0" + d;
//     }
//     return today.getFullYear() + "" + m + "" + d + "_" + today.toLocaleTimeString().replace(/:/g, "");
// }

function doCopy() {
    var note = replaceDemo(demoFile);
    if (note !== "") {
        air.Clipboard.generalClipboard.clear();
        air.Clipboard.generalClipboard.setData(air.ClipboardFormats.TEXT_FORMAT, note);
        doTimer("复制成功！", "s");
        air.trace(air.System.totalMemory / 1024);
    } else {
        doTimer("内容为空！", "w");
    }
}

function doBackup(backuppath) {
    var note = demoFile.content;

    if (note != "") {
        try {
            var file = air.File.desktopDirectory.resolvePath(backuppath);

            var stream = new air.FileStream();
            stream.open(file, air.FileMode.WRITE);
            stream.writeMultiByte(note, demoFile.outencode);
            stream.close();
            doTimer("成功备份到：" + backuppath + "! ", "s");
        } catch (error) {
            doTimer(error, "w");
        }
    }
}

function doSave() {
    var note = replaceDemo(demoFile),
        name = demoFile.name,
        path = demoFile.path,
        temp_file = name.split("."),
        suffix = temp_file.length > 1 ? temp_file.pop() : "txt",
        file_name = temp_file.length > 1 ? temp_file.join(".") : temp_file,
        filename = file_name.toString().split("_"),
        path = path.toString().slice(0, path.length - name.length),
        dir = demoFile.savedir != "" ? demoFile.savedir.toString() : path;
    if (filename.length > 1 && _.indexOf(filename, "tidemo") != -1) {
        filename = _.without(filename, "tidemo");
    } else {
        var backupname = _.union(["tidemo"], filename),
            backuppath = dir + backupname.join("_") + '.' + suffix;
        doBackup(backuppath);
    }

    if (note != "") {
        filename = filename.join("_");
        // var path = file_name + '_' + getTime() + '.' + suffix;
        savepath = dir + filename + '.' + suffix;
        // air.trace(savepath);
        try {
            var file = air.File.desktopDirectory.resolvePath(savepath);

            var stream = new air.FileStream();
            stream.open(file, air.FileMode.WRITE);
            stream.writeMultiByte(note, demoFile.outencode);
            stream.close();
            doTimer("成功保存到：" + savepath + "！", "s");
        } catch (error) {
            doTimer(error, "w");
        }
    } else {
        doTimer("模板内容为空", "w");
    }
}

var appMain = function() {
    function onExit(event) {
        air.NativeApplication.nativeApplication.icon.bitmaps = [];
        air.NativeApplication.nativeApplication.exit();
    }

    function onMin(event) {
        window.nativeWindow.minimize();
    }

    function onHide(event) {
        window.nativeWindow.visible = false;
    }

    function onShow(event) {
        window.nativeWindow.visible = true;
    }

    function onTop(even) {
        var temp = window.nativeWindow.alwaysInFront;
        if (!temp) {
            window.nativeWindow.alwaysInFront = true;
        } else {
            window.nativeWindow.alwaysInFront = false;
        }
    }

    function onMove(event) {
        window.nativeWindow.startMove();
    }

    function loadApp() {
        $("#bt-open-modefile").click(function() {
            doBrowseDemo();
        });

        var help_txt = $("#setup-box .inner").html();
        $("#bt-open-help").click(function() {
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
        $("#app-title").text(gAppName + " v" + gAppVersion + " | 2012-2016 by GhostZhang@CSSForest.org");

        //任务栏图标
        if (air.NativeApplication.supportsSystemTrayIcon) {
            var iconLoad, iconMenu, moveable, i, exitCmd = [];
            iconMenu = new air.NativeMenu();
            exitCmd[1] = iconMenu.addItem(new air.NativeMenuItem("检查更新"));
            exitCmd[1].addEventListener(air.Event.SELECT, checkUpdates);
            exitCmd[1] = iconMenu.addItem(new air.NativeMenuItem("退出"));
            exitCmd[1].addEventListener(air.Event.SELECT, onExit);
            iconLoad = new air.Loader();
            iconLoad.contentLoaderInfo.addEventListener(air.Event.COMPLETE, function(event) {
                air.NativeApplication.nativeApplication.icon.bitmaps = [event.target.content.bitmapData];
            });
            iconLoad.load(new air.URLRequest("/icons/AIRApp_16.png"));
            air.NativeApplication.nativeApplication.icon.tooltip = "TIDemo";
            air.NativeApplication.nativeApplication.icon.menu = iconMenu;
            air.NativeApplication.nativeApplication.icon.addEventListener("click", function(event) {
                air.NativeApplication.nativeApplication.activate();
                window.nativeWindow.activate();
            });
        }

        moveable = ["#app-title"];
        for (i = 0; i < moveable.length; i++) {
            $(moveable[i]).mousedown(onMove);
        }

        checkUpdates();
    }
    return {
        loadApp: loadApp,
        onExit: onExit,
        onHide: onHide,
        onTop: onTop
    }
}();