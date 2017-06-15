/**
 * Created by zjl on 2017/6/15.
 */
jQuery.fn.pagination = function (amount,options) {
    options = jQuery.extend({
        itemsPerPage: 15,            //每页的记录数目
        numOfMiddle: 6,             //中间显示的页码数量
        numOfEdge: 1,               //两边显示的页码数量
        currentPage: 0,             //当前的页码
        preText: "上一页",           //上一页的文字
        nextText: "下一页",          //下一页的文字
        ellipticalText: "...",       //页码之间的省略号
        displayMsg: true,           //是否显示记录的信息
        displaySkip: false,        //是否显示跳转功能
        preShowAlways: true,       //是否总显示上一页按钮
        nextShowAlways: true,      //是否总显示下一页按钮
        linkTo: "javascript:;",     //点击页码后的链接
        callback: function () {
           return false;
        }                            //回调函数，点击页码时触发

    },options || {});

    return this.each(function () {
        //总页数
        function pageCount() {
           return Math.ceil(amount/options.itemsPerPage);
        }
        
        //中间显示的页码
        function pageRange() {
           var pageNum = pageCount();
           var halfNumOfMiddle = parseInt(options.numOfMiddle/2);
           var upperLimit = pageNum-options.numOfMiddle;
           var start = currentPage > halfNumOfMiddle ? Math.max(Math.min(currentPage-halfNumOfMiddle,upperLimit),0):0;
           var end = currentPage > halfNumOfMiddle ? Math.min(currentPage+halfNumOfMiddle,pageNum)
               : Math.min(options.numOfMiddle,pageNum) ;
           return [start,end];
        }

        //点击页码事件
        function selectPage(pageId,event){
            currentPage = pageId;
            drawPagination();

            var ifPropagation = options.callback(pageId,pagePanel);
            if(!ifPropagation){
                if(event.stopPropagation){
                    event.stopPropagation();
                }else {
                    event.cancelable = true;
                }
            }
            return ifPropagation;
        }

       //绘制页码
        function drawPagination(){
            pagePanel.empty();
            var pageRangeInMiddle = pageRange();
            var pageNum = pageCount();

            var clickHandler = function (pageId) {
               return function (event) {
                   selectPage(pageId,event);
               }
            };

            var appendItem = function (pageId,appendOpts) {
                pageId = pageId < 0 ? 0 : (pageId < pageNum ? pageId : pageNum-1);
                appendOpts = jQuery.extend({
                    text: pageId+1,
                    classes: ""
                },appendOpts || {});
                if(currentPage == pageId){
                    var item = jQuery("<span class='current'>"+appendOpts.text+"</span>");
                }else{
                    var item = jQuery("<a>" + appendOpts.text + "</a>").bind(
                        "click", clickHandler(pageId)).attr('href',
                        options.linkTo.replace(/__id__/, pageId));
                }
                if (appendOpts.classes) {
                    item.addClass(appendOpts.classes);
                }
                pagePanel.append(item);
            };
            //上一页
            if(options.preText && (currentPage > 0 || options.preShowAlways)){
                appendItem(currentPage-1,{
                    text: options.preText,
                    classes: "pre"
                })
            }
            //起始页码到 ...
            if(pageRangeInMiddle[0] > 0 && options.numOfEdge > 0){
                var end = Math.min(options.numOfEdge,pageRangeInMiddle[0]);
                for(var i=0;i<end;i++){
                    appendItem(i);
                }
                if(end<pageRangeInMiddle[0] && options.ellipticalText){
                    jQuery("<span class='elliptical'>" + options.ellipticalText + "</span>").appendTo(pagePanel);
                }
            }
            //中间页码
            for(var i=pageRangeInMiddle[0];i<pageRangeInMiddle[1];i++){
                appendItem(i);
            }
            //...到最后的页码
            if(pageRangeInMiddle[1]<pageNum && options.numOfEdge>0){
                if((pageNum-options.numOfEdge)>pageRangeInMiddle[1] &&options.ellipticalText){
                    jQuery("<span class='elliptical'>" + options.ellipticalText + "</span>").appendTo(pagePanel);
                }
                var begin = Math.max(pageRangeInMiddle[1],pageNum-options.numOfEdge);
                for(var i=begin;i<pageNum;i++){
                    appendItem(i);
                }
            }
            //下一页
            if(options.nextText && (currentPage <pageNum-1 || options.nextShowAlways)){
                appendItem(currentPage+1,{
                    text: options.nextText,
                    classes: "next"
                })
            }
            //显示记录信息
            if(options.displayMsg){
                if(!amount){
                    pagePanel.append("<div class='notice'>暂无数据可以显示</div>");
                }else{
                    pagePanel.append('<div class="notice">当前显示第&nbsp;'
                        + ((currentPage * options.itemsPerPage) + 1)
                        + '&nbsp;条到&nbsp;'
                        + (((currentPage + 1) * options.itemsPerPage) > amount
                            ? amount
                            : ((currentPage + 1) * options.itemsPerPage))
                        + '&nbsp;条记录，总共&nbsp;' + amount + '&nbsp;条</div>');
                }
            }
            //跳转
            if(options.displaySkip){
                pagePanel.append("<div class='skip'>跳转到<input type='text'>页" +
                    "<button type='button'>确定</button></div>");
            }

        }

        var pagePanel = jQuery(this);
        var currentPage = (!options.currentPage || options.currentPage<0) ? 0 : options.currentPage;
        amount = (!amount || amount<0) ? 0 : amount;
        options.itemsPerPage = (!options.itemsPerPage || options.itemsPerPage<0) ? 0 : options.itemsPerPage;

        //提供给外部的接口
        this.pageSelected = function (pageId) {
            selectPage(pageId);
        };
        this.prePage = function (pageId) {
           if(pageId>0) {
               selectPage(pageId-1);
               return true;
           }else{
               return false;
           }
        };
        this.nextPage = function (pageId) {
           if(pageId < pageCount() - 1){
               selectPage(pageId+1);
               return true;
           }else{
               return false;
           }
        };

        //绘制页码插件
        if(amount === 0){
            pagePanel.empty();
            pagePanel.append("<div class='notice'>暂无数据可以显示</div>");
        }else{
            drawPagination();
        }
        //为跳转按钮绑定事件
        pagePanel.on("click",".skip button",function (event) {
           var skipTo = $(this).parent().find("input").val();
           if(skipTo !== null && skipTo !== 0 &&skipTo > 0 && skipTo <= pageCount()){
               selectPage(skipTo-1);
           }
        })

    })
};