

# TIDemo

文件模板工具

## 基本功能

### 格式

**基本格式**

	<!-- ::config::
	设置内容
	-->

可选项有：

	<!-- ::config::utf-8::AUTOSAVE::CONDITION::
	设置内容
	-->

1. utf-8：输出编码，如果要使用跟文件一样的编码输出，可以不加
2. autosave:：启用自动保存文件
3. CONDITION:：启用数据筛选

设置格式为：**`@变量名@:变量类型(说明文本)|默认值`**;

1. 变量名以『`@`』包裹
2. 变量名不能包含空格或制表符
3. 变量名后以『`:`』分隔，紧跟着变量类型
4. 说明文本以『`()`』包裹
5. 说明文本后加『`|`』分隔，可设置默认值
6. 以『`;`』结束

**设置内容可以为空，但模板文件中必须有以上的基本格式，否则无法读取模板文件。**

### 当前支持的设置项

	<!-- ::config::utf-8::
	@savedir@:set|C:\Desktop\;
	-->

<dl>
		<dt>savedir</dt>
			<dd>设置输出文件路径</dd>
</dl>

### 当前支持的变量类型

<dl>
	<dt>set</dt>
		<dd>设置项目</dd>
	<dt>text</dt>
		<dd>单行输入框</dd>
	<dt> a 或 link</dt>
		<dd>链接的默认值设置顺序（以“,”分隔），顺序为：链接文本默认值,链接地址默认值,新窗口打开</dd>
	<dt> textarea 或 html</dt>
		<dd>多行输入框</dd>
	<dt> qr</dt>
		<dd>输出二维码</dd>
</dl>

### 模板文件命名

1. 输出的文件会保存到模板文件目录下
2. 如果模板文件以"tidemo_"开头命名，输出的新文件会自动去掉"tidemo_"，得到最终的文件名

### 例子

	<!-- ::config::utf-8::
	@title@:text(站点名)|CSS森林;
	@link@:a(首页链接)|CSS森林,http://www.cssforest.org/blog/,true;
	-->
	<title>@title@</title>
	@link@

将上面的内容保存为文件，拖入TIDemo，将解析为

	<title>CSS森林</title>
	<a href="http://www.cssforest.org/blog/" target="_blank">CSS森林</a>

## 高级功能

### 循环输出

	<!-- ::loop(商品列表)::auto::
	设置内容
	-->
	循环模板内容
	<!-- ::loop end:: -->

设置格式为：**`::loop(说明信息)::循环次数::`**

1. 关键字为『`loop`』
2. 说明文本以『()』包裹
3. 循环次数只能为正整数或『`auto`』关键字
4. 循环次数为『`auto`』时，将根据数据文件行数进行循环，自动过滤空行
5. 以『`<!-- ::loop end:: -->`』结束

#### 当前支持的设置项

	<!-- ::loop(商品列表)::auto::
	@DB@:set|数据文件.txt;
	@IF@:set(变量名)|变量值;
	@REPLACE@:set(start)|"正则表达式";
	-->

<dl>
	<dt>DB</dt>
		<dd>设置外部连接的数据文件路</dd>
	<dt>IF</dt>
		<dd>当数据表中变量名为变量值的时候</dd>
	<dt> REPLACE</dt>
		<dd>删除循环填充数据之后的多余字符，只能删除循环体开始（start）或结束（end）位置的字符</dd>
</dl> 

### 导入数据文件

#### 创建数据文件

使用excel建立数据文件，第一行为变量名。然后导出为*txt格式*文件，与模板文件放在同个目录下。导出的内容类似：

	valueA	valueB	valueC
	A1	A2	A3
	B1	B2	B3

#### 链接数据文件

在循环定义设置变量『`DB`』,变量类型为『`set`』,

	<!-- ::loop(商品列表)::3::
	@DB@:set|数据文件.txt;
	@valueA@:text(变量A);
	@valueB@:text(变量B);
	@valueC@:text(变量C);
	-->
	这里输出变量A的内容：@valueA@；
	这里输出变量B的内容：@valueB@；
	这里输出变量C的内容：@valueC@；
	<!-- ::loop end:: -->

结果：

	这里输出变量A的内容：A1；
	这里输出变量B的内容：A2；
	这里输出变量C的内容：A3；
	这里输出变量A的内容：B1；
	这里输出变量B的内容：B2；
	这里输出变量C的内容：B3；
	这里输出变量A的内容：；
	这里输出变量B的内容：；
	这里输出变量C的内容：；

### 数据筛选

#### 创建数据文件

使用excel建立数据文件，第一行为变量名。然后导出为*txt格式*文件，与模板文件放在同个目录下。导出的内容类似：

	valueA	valueB	valueC
	A1	B1	C1
	A2	B1	C2
	A3	B3	C2

#### 链接数据文件，设置筛选条件

在循环定义设置变量『`DB`』,变量类型为『`set`』,
设置变量『`IF`』,变量类型为『`set`』,

	<!-- ::loop(商品列表)::auto::
	@DB@:set|数据文件.txt;
	@IF@:set(valueA)|A2;
	@valueA@:text(变量A);
	@valueB@:text(变量B);
	@valueC@:text(变量C);
	-->
	这里输出变量A的内容：@valueA@；
	这里输出变量B的内容：@valueB@；
	这里输出变量C的内容：@valueC@；
	<!-- ::loop end:: -->

结果：

	这里输出变量A的内容：A2；
	这里输出变量B的内容：B1；
	这里输出变量C的内容：C2；

### 二维码解析

#### 创建数据文件

使用excel建立数据文件，第一行为变量名。然后导出为txt格式文件，与模板文件放在同个目录下。导出的内容类似：

	valueA
	ghostzhang

#### 设置二维码

设置变量为『`QR`』,变量类型为『`set`』，变量类型为『`qr`』

	@QR@:set(bg,w,m,el)|ffffff,100,10,h;

包含设置项：

<dl>
	<dt>bg</dt>
		<dd>背景颜色  bg=颜色代码，例如：bg=ffffff</dd>
	<dt>fg</dt>
		<dd>前景颜色  fg=颜色代码，例如：fg=cc0000</dd>
	<dt>gc</dt>
		<dd>渐变颜色  gc=颜色代码，例如：gc=cc00000</dd>
	<dt>el</dt>
		<dd>纠错等级  el可用值：h\q\m\l，例如：el=h</dd>
	<dt>w</dt>
		<dd>尺寸大小   w=数值（像素），例如：w=300</dd>
	<dt>m</dt>
		<dd>静区（外边距）    m=数值（像素），例如：m=30</dd>
	<dt>pt</dt>
		<dd>定位点颜色（外框） pt=颜色代码，例如：pt=00ff00</dd>
	<dt>inpt</dt>
		<dd>定位点颜色（内点）   inpt=颜色代码，例如：inpt=000000</dd>
	<dt>logo</dt>
		<dd>logo图片  logo=图片地址</dd>
</dl>

	<!-- ::loop(商品列表)::
	@DB@:set|数据文件.txt;
	@QR@:set(w,m)|100,10;
	@valueA@:qr(变量A);
	-->
	这里输出二维码的内容：<img src="@valueA@" />
	<!-- ::loop end:: -->

结果：

这里输出二维码的内容：![](http://qr.liantu.com/api.php?text=ghostzhang&w=100&m=10)；