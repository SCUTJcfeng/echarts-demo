
$.extend({
    getUrlSearchString:function(name){//获得url中的参数
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var result = window.location.search.substr(1).match(reg);
        if(result != null){
            return result[2];
        }else{
            return null;
        }
    },
    removeByValue:function (arr, val) {//删除数组中的某个元素
        for(var i = 0; i < arr.length; i++) {
            if(arr[i] == val) {
                arr.splice(i, 1);
                break;
            }
        }
    },
    isContains:function (str, substr) {//str 是否包含subStr
        return str.indexOf(substr) >= 0;
    },
    print:function(str){//打印
		var host =  window.location.host;
		if(host === "active.celuechaogu.com"){
			
		}else{
			console.log(str);
		}
	},
   	divideGroup:function (ary) {//把数组中相同元素 分到一起
		var res = [];
		ary.sort();
		for(var i = 0; i < ary.length;) {
			var count = 0;
			for(var j = i; j < ary.length; j++) {
				if(ary[i] == ary[j]) {
					count++;
				}
			}
			res.push([ary[i], count]);
			i += count;
		}
		return res;
	}
})

$.fn.extend({
    animateCss: function (animationName) {
        var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';
        this.addClass('animated ' + animationName).one(animationEnd, function() {
            $(this).removeClass('animated ' + animationName);
        });
    }
});
/*
 	APP页面公用JS——方法
 * 1、分享出去的页面底部带有下载按钮
 * 2、简易toast层
 * */


;(function($){
	/*
	 	1、分享出去页面的下载按钮
	 * 1、根据地址栏传入参数others=1来判断是否显示下载按钮
	 * 2、点击下载按钮跳转下载页面
	 * 3、方法调用传入的ele的值必须为元素id
	 * 使用说明：参数可有可无  参数类型必须为String
	 * 有参：href      跳转路径
	 * 		 str       地址栏传入参数
	 * 		 callback  回调函数
	 * 		parent :   底部内边距元素的选择器".early_container"
	 * */
	var setDownLoadBtns = function(params,callback){
		if(params.href == undefined) params.href = 'http://a.app.qq.com/o/simple.jsp?pkgname=com.luna.celuechaogu&ckey=CK1321391768919';
		if(params.str == undefined) params.str = 'others=1';
		if(callback != undefined){
			if(typeof callback == 'function'){
				this.callback = callback;
			}	
		}
		this.isShow = false;
		this.callback = callback;
		this._queryStr = window.location.search.slice(1);
		this.defaults = {
			isShare : false
		};
		this.queryIndex = this._queryStr.indexOf(params.str);
		if(this.queryIndex != -1) this.defaults.isShare = true;
		this.options = $.extend({},this.defaults,params);
		return this.init();
	}
	setDownLoadBtns.prototype = {
		showbtn : function(){
			var _self = this;
			if(_self.options.isShare){
				_self.options.target.show();
				_self.isShow = true;
				var targetHeight = Number(_self.options.target.css("padding-top").slice(0,-2))+10;
				$(_self.options.parent).css({
					"padding-bottom" : targetHeight + "px"
				});
			}else{
				_self.options.target.hide();
				_self.isShow = false;
			}
		},
		bindEvents : function(){
			var _self = this;
			_self.options.target.bind('click tap',function(){
				window.location.href = _self.options.href;
			})
		},
		init : function(){
			var _self = this;
			_self.showbtn();
			_self.bindEvents();
			if(_self.isShow){
				_self.callback && _self.callback();
			}
		}
	}
	$.fn.setDownLoadBtn = function(options,callback) {
		if(options == undefined) options = {};
		options.target = $(this);
		var setDownLoadBtn = new setDownLoadBtns(options,callback);
		return setDownLoadBtn;
	}
	
})(jQuery)