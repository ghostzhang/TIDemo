/**
 * @author ghostzhang
 */
function checkUpdates(){
    var parser, xml_obj, root, g_app_version, g_app_name;
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
		if (cont.name == g_app_name){
			if (g_app_version == cont.version){
				alert("您使用的版本是最新版（"+ g_app_version +"），感谢您的关注！");
			}else{
				var update_box = '<div id="update_box"><h3>当前有新版本</h3><p>最新版本：<strong>'+ cont.version +'</strong><br />当前版本：'+ g_app_version +'</p><p>版本信息：<br />'+ cont.description +'</p><p>更新地址：<br /><textarea rows="3" cols="50">'+ cont.url +'</textarea></p></div><div id="alphaBox"></div>';
				$("body").append(update_box)
			}
		}
	});
}