<!-- ::config::

@title@:text(站点名)|CSS森林;
@link@:text(首页链接)|http://www.cssforest.org/blog/;
-->
--@title@
--@link@

--添加商户数据
INSERT INTO tablename ("valueA", "valueB", "valueC")VALUES
<!-- ::loop(商品列表)::auto::
@db@:set|城市列表2.txt;
@replace@:set(end)|",";
@valueA@:text(编号);
@valueB@:text(商户名称);
@valueC@:text(城市);
-->
('@valueA@', '@valueB@', '@valueC@'),
<!-- ::loop end:: -->
;