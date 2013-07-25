/**
 * @author ghostzhang
 * 合适AIRSDK 1.5
 */

function checkUpdates(e) {
	var parser, xml_obj, root, g_app_version, g_app_name, auto_check;
	auto_check = e == undefined ? false : true;
	parser = new DOMParser();
	xml_obj = parser.parseFromString(air.NativeApplication.nativeApplication.applicationDescriptor, "text/xml");
	root = xml_obj.getElementsByTagName("application")[0];
	g_app_version = root.getElementsByTagName("version")[0].firstChild.data;
	g_app_name = root.getElementsByTagName("filename")[0].firstChild.data;
	$.ajax({
		url: "http://www.cssforest.org/AIR/TIDemo/update.json",
		dataType: "json",
		cache: false
	}).done(function(cont) {
		if (cont.name == g_app_name) {
			if (g_app_version == cont.version) {
				if (auto_check) {
					alert("您使用的版本是最新版（" + g_app_version + "），感谢您的关注！");
				}
			} else {
				var update_box = '<div id="update_box"><h3>当前有新版本</h3><p>最新版本：<strong>' + cont.version + '</strong><br />当前版本：' + g_app_version + '</p><p>版本信息：<br />' + cont.description + '</p><p>更新地址：<br /><span style="color:#81433E">' + cont.url + '</span><button id="bt_copyurl">复制地址</button></p><button id="bt_checkupdates_close" type="button">X</button></div><div id="alpha_box"></div>';
				$("body").append(update_box);
				$("#update_box").attr("style", "position:absolute;top:20%;left:50%;z-index:1001;width:60%;padding:4px 12px;min-height:60px;margin-left:-30%;background-color:#FFFFFF;border:1px solid #000000;-webkit-box-shadow:0 2px 6px rgba(0,0,0,0.27),0 0 40px rgba(0,0,0,0.06) inset;font-size:12px;word-wrap:break-word;word-break:normal;");
				$("#alpha_box").attr("style", "width:100%;height:100%;background:#000;position:absolute;top:0;left:0;opacity:0.4;");
				$("#bt_checkupdates_close").attr("style", "position:absolute;top:0;right:0;");
				$("#bt_checkupdates_close").click(function() {
					checkUpdates_close();
				});
				$("#bt_copyurl").click(function() {
					copyURL(cont.url);
				});
				$("html").css("overflow", "hidden");
			}
		}
	});

	function checkUpdates_close() {
		$("#update_box").remove();
		$("#alpha_box").remove();
		$("html").css("overflow", "auto");
	}

	function copyURL(txt) {
		if (txt !== "") {
			air.Clipboard.generalClipboard.clear();
			air.Clipboard.generalClipboard.setData(air.ClipboardFormats.TEXT_FORMAT, txt);
			alert("已复制到剪贴板，请在浏览器中下载完成更新！");
		}
	}
}