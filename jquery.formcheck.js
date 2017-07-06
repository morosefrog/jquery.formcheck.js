/**
 * Plug-In name: jquery.formCheck.js
 * Versions: 1.2.1
 * Modify time: 2017/07/06
 * Created by TomnTang on 2016/07/18
 * Website: http://www.lovevivi.com/plugin/jquery.formcheck.js/
 */

;(function($, win){
    $.fn.formCheck = function(options){
        var defaults = {
            debug: false,
            onBlur: true,
            items: {},
            pass: false,
            passSubmit: null,
            beforeSubmit: null,
            ajaxList: {},
            scope: false
        };

        win.formCheck = {
            ver: 'Versions: 1.2.1',
            time: 'Modify Time: 2017/07/06',
            init: init
        };

        var reg = {
            required: function(obj){ // 判断不为空，返回true
                return (obj.value == '') ? false : true;
            },
            empty: function(obj){ // 判断为空，返回true
                return (obj.value == '') ? true : false;
            },
            text: function(obj){ // 判断是否全是中文、英文、数字
                var regular = /^[0-9A-Za-z\u4E00-\u9FA5]+$/;
                return regular.test(obj.value) ? true : false;
            },
            number: function(obj){ // 判断是否全是英文、数字
                var regular = /^[0-9A-Za-z]+$/;
                return regular.test(obj.value) ? true : false;
            },
            digits: function(obj){ // 判断是否全是数字
                var regular = /^[0-9]+$/;
                return regular.test(obj.value) ? true : false;
            },
            money: function(obj){ // 判断是浮点数或整数
                var regular = /^(\d+|\d+\.\d{1,2})$/;
                return regular.test(obj.value) ? true : false;
            },
            email: function(obj){ // 判断是否为Email
                var regular = /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/;
                return regular.test(obj.value) ? true : false;
            },
            url: function(obj){ // 判断是否为URL地址
                var regular = /^\b(((https?|ftp):\/\/)?[-a-z0-9]+(\.[-a-z0-9]+)*\.(?:com|net|org|cn|biz|info|name|[a-z][a-z]|((25[0-5])|(2[0-4]\d)|(1\d\d)|([1-9]\d)|\d))(:\d{4})?\b(\/[-a-z0-9_:\@&?=+,.!\/~%\$]*)?)$/i;
                return regular.test(obj.value) ? true : false;
            },
            icard: function(obj){ // 判断15位或18位身份证格式是否正确
                var regular = /(^\d{15}$)|(^\d{17}(\d|x)$)/i;
                return regular.test(obj.value.toUpperCase()) ? true : false;
            },
            mac: function(obj){ // 判断是否是MAC格式
                var regular = /(^[A-F\d]{2}[A-F\d]{2}[A-F\d]{2}[A-F\d]{2}[A-F\d]{2}[A-F\d]{2}$)|(^[A-F\d]{2}(-|:)[A-F\d]{2}(-|:)[A-F\d]{2}(-|:)[A-F\d]{2}(-|:)[A-F\d]{2}(-|:)[A-F\d]{2}$)/;
                return regular.test(obj.value.toUpperCase()) ? true : false;
            },
            ip: function(obj){ // 判断是否是ip格式
                var regular = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
                return regular.test(obj.value) ? true : false;
            },
            mobile: function(obj){ // 判断是否是固话手机格式
                var regular = /(^(\d{3,4})?(-)?\d{7,8}$)|(^1\d{10}$)/;
                return regular.test(obj.value) ? true : false;
            },
            chinese: function(obj){ // 判断是否全是中文
                var regular = /^[\u4E00-\u9FA5]+$/;
                return regular.test(obj.value) ? true : false;
            },
            english : function(obj){ // 判断是否全是英文
                var regular = /^[A-Za-z]+$/;
                return regular.test(obj.value) ? true : false;
            },
            textarea : function(obj){ // 判断是否全是中文、英文、数字、\n换行符
                var regular = /^[0-9A-Za-z\u4E00-\u9FA5\n]+$/;
                return regular.test(obj.value) ? true : false;
            },
            checked: function(obj){ // 判断是否checked
                return (obj.checked) ? true : false;
            },
            minlength: function(obj){ // 判断最小长度为min
                return (obj.value.length >= obj.minlength) ? true : false;
            },
            maxlength: function(obj){ // 判断最大长度为max
                return (obj.value.length <= obj.maxlength) ? true : false;
            },
            min: function(obj){ // 判断最小数值为min
                return (obj.value >= obj.min) ? true : false;
            },
            max: function(obj){ // 判断最大数值为max
                return (obj.value <= obj.max) ? true : false;
            }
        };
        var settings = $.extend({}, defaults, options), status = true, submitMode = false, formObj = this.selector, debug = {
            log: function(text){settings.debug && console.log(text);},
            error: function(text){settings.debug && console.error(text);},
            info: function(text){settings.debug && console.info(text);}
        };
        var regs = function(){
            var temp = $.extend(reg, settings.reg);
            delete settings.reg;
        }();

        function verify(id, value, event){
            var obj = {}, that = (settings.scope ? $(''+ formObj).find('#'+id) : $('#'+id));

            if (!that[0]) {
                layer.msg('id='+id+'不存在!');
                return status = false;
            }

            debug.log('event= '+ event);

            if (event == 'onblur' && submitMode) {
                return;
            } else if (event == 'onsubmit') {
                submitMode = true;
            }

            obj.that = that;
            obj.id = id;
            obj.tag = that.get(0).tagName;
            obj.type = that.attr('type');
            obj.value = $.trim(that.val());
            obj.checked = that.prop('checked');
            obj.minlength = value.minlength;
            obj.maxlength = value.maxlength;
            obj.min = value.min;
            obj.max = value.max;
            obj.verify = value.verify;
            obj.position = value.position || 2;
            obj.error = value.error || '检测未通过';
            obj.success = value.success || '检测通过';
            obj.onError = value.onError || null;
            obj.onSuccess = value.onSuccess || null;
            obj.ajaxType = (value.ajax && value.ajax.type) ? value.ajax.type : 'POST';
            obj.ajaxURL = (value.ajax && value.ajax.url) ? value.ajax.url : '';
            obj.callback = (value.ajax && value.ajax.callback) ? value.ajax.callback : null;
            obj.onoff = value.onoff || null;

            if (obj.onoff) {
                var _id,_value;
                for (var key in obj.onoff) {
                    _id = key;
                    _value = obj.onoff[key];
                }
                var _onoff = verify(_id, _value, 'onoff');
                debug.info('onoff= '+_onoff);
                if (!_onoff) {
                    return status = true;
                }
            }

            debug.log('id= '+id+', value= '+JSON.stringify(value));

            for (var i=0, length=obj.verify.length; i < length; i++ ) {

                if (obj['verify'][i] == 'empty') {
                    if(reg['required'](obj)) {
                        status = (obj['verify'][i] == 'empty') ? true : reg[obj['verify'][i]](obj);
                        showTips(status);
                        if (!status) { return status; }
                    }else{
                        return status = true;
                    }
                }else{
                    status = reg[obj['verify'][i]](obj);
                    showTips(status);
                    if (!status) { return status; }
                }

            }

            function showTips(status, sort, data) {
                if (!status) {
                    (event == 'onsubmit' || sort == 'ajax') && that[0].focus();
                    if (event != 'onoff') {
                        if (obj.callback && sort == 'ajax') {
                            debug.info('======= 开始调用callback data='+ data +' =======');
                            obj.callback(data, that);
                        } else {
                            (obj.onError) ? obj.onError(that) : layer.tips(obj.error, that, {tips: obj.position});
                        }
                    }
                    that.addClass('error').removeClass('success');
                    submitMode = false;
                    debug.error('======= ' + ((obj['verify'][i] === undefined) ? 'ajax' : obj['verify'][i]) + ' 未检测通过 ===========');
                } else {
                    if (!settings.ajaxList[id]) {
                        (obj.onSuccess) ? obj.onSuccess(that) : that.addClass('success').removeClass('error');
                    } else if (sort == 'ajax') {
                        if (obj.callback) {
                            obj.callback(data, that);
                            var timer = setTimeout(function(){
                                if ($(document.activeElement).context.type == 'submit') {
                                    that.parents('form').submit();
                                    clearTimeout(timer);
                                    debug.log('ajax完成后，表单再次自动提交！');
                                }
                            }, 1000);
                        } else {
                            obj.onSuccess && obj.onSuccess(that);
                            debug.log('getEvent= '+ $(document.activeElement).context.type);
                            if ($(document.activeElement).context.type == 'submit') {
                                that.parents('form').submit();
                                debug.log('ajax完成后，表单再次自动提交！');
                            }
                        }

                        that.addClass('success').removeClass('error');
                    }
                }
            }

            var isCallback = null, timer = null, loading = null, argData = {}, returnData = '';
            if (settings.ajaxList[id]) {
                debug.log('settings.ajaxList[id]= '+ JSON.stringify(settings.ajaxList[id]));

                if (settings.ajaxList[id].value !== obj.value) {
                    loading = layer.load(0);
                    settings.ajaxList[id].value = obj.value;
                    argData[id] = obj.value;
                    debug.log(argData);
                    $.ajax({
                        type: obj.ajaxType,
                        url: obj.ajaxURL,
                        data: argData,
                        dataType: 'json',
                        success:function(data) {
                            returnData = data;
                            if (data.code == '1') {
                                isCallback = true;
                            } else {
                                isCallback = false;
                            }
                            debug.log('isCallbackData= '+ JSON.stringify(data));
                            debug.log('isCallback= '+ isCallback);
                        }
                    });
                    timer = setInterval(function() {
                        if (isCallback == null) {
                            debug.log('ajax请求还没返回'+ isCallback);
                        } else if (isCallback == false) {
                            debug.log('ajax请求返回'+ isCallback);
                            settings.ajaxList[id].isCheck = isCallback;
                            layer.close(loading);
                            clearInterval(timer);
                            showTips(isCallback, 'ajax', returnData);
                            return isCallback;
                        } else {
                            debug.log('ajax请求返回ok='+ isCallback);
                            settings.ajaxList[id].isCheck = isCallback;
                            layer.close(loading);
                            clearInterval(timer);
                            showTips(isCallback, 'ajax', returnData);
                            return isCallback;
                        }
                    }, 500);
                } else {
                    debug.info('值没改变不检测，取上次结果！'+ settings.ajaxList[id].isCheck);
                    status = settings.ajaxList[id].isCheck;
                    showTips(status);
                    return status;
                }
            }
            debug.log(event +'=>准备返回结果status='+ status);
            if (isCallback == null && timer != null) { status = false; }
            return status;
        }

        function init(){
            var event = 'onblur';

            $.each(settings.items, function(id, value){
                var that = (settings.scope ? $(''+ formObj).find('#'+id) : $('#'+id));
                that.off('blur');
            });

            if (settings.onBlur) {
                $.each(settings.items, function(id, value){
                    if (value.onBlur !== false) {
                        var that = (settings.scope ? $(''+ formObj).find('#'+id) : $('#'+id));
                        that.on('blur', function(){
                            verify(id, value, event);
                        });
                    }
                });
            } else {
                $.each(settings.items, function(id, value){
                    if (value.onBlur === true) {
                        var that = (settings.scope ? $(''+ formObj).find('#'+id) : $('#'+id));
                        that.on('blur', function(){
                            verify(id, value, event);
                        });
                    }
                });
            }

            $.each(settings.items, function(id, value){
                var isAjax = value.ajax ? value.ajax.url : '';
                if (isAjax) {
                    var that = (settings.scope ? $(''+ formObj).find('#'+id) : $('#'+id));
                    var val = $.trim(that.val());
                    if (value.ajax.check === true) { val = null; }
                    var modifyState = (val != '') ? true : false;
                    settings.ajaxList[id] = {value: val, isCheck: modifyState};
                    debug.log('ajaxList= '+ JSON.stringify(settings.ajaxList));
                }
            });
        }

        function check(){
            var event = 'onsubmit';
            $.each(settings.items, function(id, value){
                return verify(id, value, event);
            });
        }

        return this.each(function(){
            init();
            $(this).on('submit', function(){
                settings.beforeSubmit && settings.beforeSubmit();
                check();
                if (status) {
                    debug.info('表单检测通过！');
                    settings.passSubmit && settings.passSubmit();
                    if (settings.pass) {
                        return true;
                    }
                }else{
                    debug.error('表单禁止提交!');
                }
                return false;
            });
        });

    }
})(jQuery, window);