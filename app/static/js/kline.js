/**
 * Created by mayige on 2017/3/2.
 */

/*
 求一个叫的cos值 =  cos_value
 
 Math.acos(cos_value) * 180 / Math.PI
 根据cos值 求得  acos值
 * */

$(function () {
    /* configs
        currency_type:'', 那种数字货币
        currency_k_types:[], 多少种k线 数组
        currency_k_id:'', id
    * */
    var CurrencyKLine = function (configs) {
        
        this.currency_chart = {};   //myChart
        this.currency_option = {}; //option
        this.currency_request_kparam = {}; //paraObject

        this.fromType = configs.fromType;//区分是不是跨域来的
        this.currency_k_sources = configs.currency_k_types; //k 类型资源
        this.currency_k_types_show = configs.currency_k_types_show;
        this.currency_server_pwd = '/currency/kline';
        this.currency_server_target = '/currency/kmagic';

        this.currency_type = configs.currency_type_sources[0][0]; //那种数字货币
        this.currency_k_id = configs.currency_k_id; //id
        this.currency_type_sources = configs.currency_type_sources;//数字货币的种类
        this.currency_type_sources_show = configs.currency_type_sources_show;//展示内容

        this.currency_configs = {
            kParamType:'param',//1minparam:{}
            kDataType:'data', //1mindata:{}
            classType:'_class'
        }
        this.currency_request_kdata = {} //请求k的数据存放对象  weekObject
        this.targetState = ''; //区分指标的状态
        this.targetStateValue = {
            fz:'magic_strategy', //神奇反转
            qs:'golden_finger', //神奇趋势
            sp:'support_block' //神奇画线
        }
        this.currency_select_ktype = this.currency_k_sources[3]; //选中的哪种货币k线类型
        this.dataSize = 300; //请求数据个个数
        //关于指标的属性
        this.color_style={
            s0CF49B:'#0CF49B',
            sFD1050:'#FD1050',
            s02c468:'#02c468',
            sed3368:'#ed3368'
        }

        this.newPrie = '----';
        this.setTimer = null;

    }

    CurrencyKLine.prototype = {
        currency_init:function () { //初始化该对象   初始化k线图
            this.currency_chart = echarts.init(document.getElementById(this.currency_k_id));
            this.initChart();
            this.currency_chart.setOption(this.currency_option);
            this.currency_html();
            //组织参数
            this.product_currency_param();
            //请求数据 1min 中k线
            this.request_currency_data(this.get_currency_kParam(),this.get_currency_kData());
        },
        //组织数字货币强求参数对象 与k线值对象
        product_currency_param:function () {
            var self = this;
            //symbol=f_usd_btc&type=1min&contract_type=quarter&size=100

            this.currency_type_sources.forEach(function (value_types) {
                value_types.forEach(function (value_type) {
                    self.currency_request_kparam[value_type] = {}
                    self.currency_request_kdata[value_type] = {}
                    self.currency_k_sources.forEach(function (value) {
                        var key = value + self.currency_configs.kParamType;
                        var body = {
                            symbol:value_type,
                            type:value,
                            size:self.dataSize
                        }

                        self.currency_request_kparam[value_type][key] = body;

                        var data_key = value + self.currency_configs.kDataType;
                        var data_value = {
                            type:value,
                            xDate:[],
                            yData:[],
                            volumnData:[],
                            fzData:[],
                            zcData:[], //支撑线数据
                            qsData:[],
                            yColorData:[],
                            typeCode:0,
                            spData:[]//支撑阻挡
                        }
                        self.currency_request_kdata[value_type][data_key] = data_value;
                    })
                })

            })
        },
        currency_html:function () { //添加UI
            var self = this;

            $('.symbol-type').text(self.currency_type_sources_show[0][0]+'实时行情');
            //数字货币种类切换
            var coin_show = false;
            var coin_str = ''
            var coin_sources = this.currency_type_sources_show;
            this.currency_type_sources.forEach(function(values,indexs){
                if (values.length === 1){
                    coin_str += '<div class="one-coin-type">'
                }else {
                    coin_str += '<div class="tow-coin-type">'
                }

                values.forEach(function (value,index) {
                    coin_str += '<li class='+value+ ' >' + coin_sources[indexs][index] +'</li>';
                })
                coin_str += '</div>'
            })
            $('.coin_list_ul').append(coin_str);
            // $('.coin_list_ul li:nth-child(2)').css('color','#1d73d3');
            $('.coin_list_ul li').on('click tap',function () {
                coin_show = false;
                var class_name = $(this).attr('class');

                $('.coin_type_tag').attr('src','http://mct.ap-coin.com/static/images/2_bottom.png');
                $('.coin_list_ul').hide();

                if(self.currency_type === class_name){return};

                // $('.coin_list_ul li').css('color','#333333');
                // $(this).css('color','#1d73d3');
                $('.coin-type span').text($(this).text()+'实时行情');
                self.currency_type = class_name;
                //请求数据
                self.currency_chart.clear();
                self.initChart();
                self.currency_chart.setOption(self.currency_option);
                clearInterval(self.setTimer)
                self.currency_data_is_exist();
                
            })

            $('.coin-type').on('click tap',function () {
                $('.coin_list_ul').toggle()
                if(coin_show){
                    coin_show = false;
                    $('.coin_type_tag').attr('src','http://mct.ap-coin.com/static/images/2_bottom.png')
                }else {
                    coin_show = true;
                    $('.coin_type_tag').attr('src','http://mct.ap-coin.com/static/images/2_top.png')
                }
            })



            //分钟切换
            var source = this.currency_k_types_show;
            var str = '';
            this.currency_k_sources.forEach(function (value,index) {
                var className = value + self.currency_configs.classType;
                str += '<li class='+className+ ' >' + source[index] +'</li>';
            })
            $('.list_ul').append(str);
            $('.list_ul li:nth-child(5)').css('color','#1d73d3');
            var show = false;
            $('.list_ul li').on('click tap',function () {
                var className = $(this).attr('class');
                var arr = className.split('_');
                var type = arr[0];

                $('.list_ul').toggle();
                show = false;
                $('.list_button_tag').attr('src','http://mct.ap-coin.com/static/images/3_bottom.png')

                if (self.currency_select_ktype === type){return}
                self.currency_select_ktype = type;
                $('.list_ul li').css('color','#333333');
                $(this).css('color','#1d73d3');
                $('.list_button span').text($(this).text())
                self.initChart();
                self.currency_chart.setOption(self.currency_option);
                clearInterval(self.setTimer)
                self.currency_data_is_exist();
               
            })

            $('.list_button').click('tap click',function () {
                $('.list_ul').toggle()
                if(show){
                    show = false; //隐藏
                    $('.list_button_tag').attr('src','http://mct.ap-coin.com/static/images/3_bottom.png')
                }else {
                    show = true;//显示
                    $('.list_button_tag').attr('src','http://mct.ap-coin.com/static/images/3_top.png')
                }
            })
            $('.target').on('click tap',function () {

                $('.target').removeClass('select-target')
                $('.introduce').hide()
                if(self.targetState == $(this).attr('name')){
                    self.targetState = '';
                    // self.currency_chart.clear();
                    self.initChart();
                    self.currency_data_is_exist();
                    return;
                }else if(self.targetState == ''){
                    $(this).addClass('select-target');
                    self.targetState = $(this).attr('name');
                    self.currency_indicator_is_exit();
                }else {
                    $(this).addClass('select-target')
                    self.targetState = $(this).attr('name');
                    // self.currency_chart.clear();
                    self.initChart();
                    self.currency_chart.setOption(self.currency_option);
                    self.currency_indicator_is_exit();
                }
                $('div[tag='+$(this).attr('name')+']').show()
               

            })
            var time_html = "<div class='time_content' style='color:#222222'><span class='new-price'><span class='header'></span><span class='middle'></span><span style='color:#707070'><span class='miao'>--</span>秒后更新数据</span></div>"
            $('.content').append(time_html);
        },
        //定时请求数据
        setTimerAction(){
            var self = this;
            clearInterval(self.setTimer)
            var total = 60;
            this.setTimer = setInterval(function(){
                $('.miao').text(total);
                if(total == 0){
                    clearInterval(self.setTimer)
                    //发起请求
                    var dataObject = self.get_currency_kData();
                    dataObject.yData = [];
                    dataObject.xDate = [];
                    dataObject.fzData = [];
                    dataObject.qsData = [];
                    dataObject.spData = [];
                    dataObject.zcData = [];
                    dataObject.volumnData = [];
                    dataObject.yColorData = [];
                    self.currency_indicator_is_exit();
                }else{
                    total = total - 1;
                }  
            },1000)
        },

        //请数字货币k线前 判断本地是否有该数据
        currency_data_is_exist:function () {
            var dataObject = this.get_currency_kData();
            if(dataObject.yData.length > 0 && dataObject.xDate.length > 0){
                if(this.targetState == ''){
                    this.handle_settime_title(dataObject);
                    this.product_k_option(dataObject);//画k线
                }else {
                    this.currency_indicator_is_exit();
                }

            }else {
                this.request_currency_data(this.get_currency_kParam(),dataObject);
            }
        },
        //数字货币k线数据请求
        request_currency_data:function (param,dataObject) {
            if(this.fromType === 'kuayu'){
                this.request_kuayu_currency_data();
            }else{
                var self = this;
                self.request_loading(true);
                $.ajax({
                    type:'get',
                    url:self.currency_server_pwd,
                    data:param,
                    success:function (data) {
                        // var _data = JSON.parse(data);
                        if (data.code == 'OK'){
                            self.currency_handleData(data.data,dataObject);
                        }else{
                            self.request_loading_data()
                        }
                    },
                    error:function () {
    
    
                    }
                })
            }
           
        },
        request_kuayu_currency_data:function(){
            var self = this;
            self.request_loading(true);
            $.ajax({
                type:'get',
                url:'/currency/kline',
                data:param,
                dataType: "JSONP",
                success:function (data) {
                    var _data = data;
                    if (_data.code == 'OK'){
                        self.currency_handleData(_data.data,dataObject);
                    }else{
                        self.request_loading_data()
                    }
                },
                error:function () {


                }
            })
        },
        //数字货币k线数据处理
        currency_handleData:function (data,dataObject) {
            var self = this;
            var maxArray = data.content.reverse();
            if (maxArray.length == 0){
                self.request_loading_data()
                return;
            }
            var arrayLength = maxArray.length;//减去200
            for (var i = 0;i<arrayLength;i++){
                var data_obj = maxArray[i];
                dataObject.xDate.push(data_obj.tradedate);
                var temp = [];
                temp.push(parseFloat(data_obj.open)) ;//open
                temp.push(parseFloat(data_obj.close));//close
                temp.push(parseFloat(data_obj.low));//low
                temp.push(parseFloat(data_obj.high));//high
                if(temp[0] == 0 || temp[1] == 0){
                }else {
                    dataObject.yData.push(temp);
                }
                dataObject.volumnData.push(data_obj.volume);
            }
            //如果神奇指标勾选着

            if(self.targetState !== ''){
                // self.product_k_option(dataObject);

                self.currency_indicator_is_exit();
            }else {
                self.product_k_option(dataObject)
                self.request_loading(false);
            }
            if(!this.start){
                $('.target-qs').click();
                this.start = true;
            } 
            //获取最新价格 更新到UI上
            self.handle_settime_title(dataObject);
        },
        //
        handle_settime_title:function(dataObject){
            var self = this;
            var dataArray = self.currency_type.split('_');
            var oldValue = dataObject.yData[dataObject.yData.length-2][1];
            var newValue = dataObject.yData[dataObject.yData.length-1][1];
            var str =dataArray[1].toUpperCase()
            if(newValue > oldValue){
                $('.new-price .header').css('color','#008000')
            }else if(newValue === oldValue){
                $('.new-price .header').css('color','#333333')
            }else{
                $('.new-price .header').css('color','#ff0000')
            }
            $('.new-price .header').text(newValue+'   ');
            $('.new-price .middle').text(str==='US'?'USD':str);
            self.setTimerAction();
        },
        // 组装k线数据
        product_k_option:function (dataObject) {
            var self = this;
            self.currency_option.xAxis[0].data= dataObject.xDate;
            self.currency_option.xAxis[1].data= dataObject.xDate;
            self.currency_option.series[1].data= dataObject.volumnData;
            self.currency_option.series[1].itemStyle.normal = self.currency_setBarStyle(dataObject.yData);
            if(self.targetState == self.targetStateValue.qs){
                self.currency_option.series[0].data=dataObject.yColorData;
            }else {
                self.currency_option.series[0].data= dataObject.yData;
            }
            if(dataObject.yData.length  < 70){
                self.currency_option.dataZoom[0].endValue = dataObject.yData.length;
            }else {
                self.currency_option.dataZoom[0].startValue = dataObject.yData.length-70;
                self.currency_option.dataZoom[0].endValue = dataObject.yData.length;
            }
            if(dataObject.yData[0][0] < 0.0001){
                self.currency_option.yAxis[0] = {
                    type:'value',
                    scale:true,
                    splitArea: {
                        show: true,
                        interval:1
                    },
                    interval:'auto',
                    axisLabel:{
                        textStyle:{
                            fontSize:7
                        },
                        inside:true,
                        margin:4,
                    },
                    axisTick: false,

                };
            }else {
                self.currency_option.yAxis[0]= {
                    type:'value',
                    scale:true,
                    splitArea: {
                        show: true,
                        interval:1
                    },
                    splitNumber:4,
                    axisLabel:{
                        textStyle:{
                            fontSize:7
                        },
                        inside:true,
                        margin:4,
                    },
                    axisTick: false,

                };
            }
            self.currency_chart.setOption(self.currency_option);
        },
        //loading 图
        request_loading:function (bool) {
            $('.cover').css('marginTop','0px');
            $('.cover div').css('top','180px');
            if(bool){
                $('.cover').css('display','block');
            }else {
                $('.cover').css('display','none');
            }
        },
        request_loading_data:function () {
            $('.cover').css('marginTop','80px');
            $('.cover div').css('top','100px');
            $('.cover div').text('暂无数据');
        },
        //设置柱状图颜色
        currency_setBarStyle:function (data) {
            var self = this;
            var normal = {
                color: function(params) {
                    var colorList;
                    if(data[params.dataIndex]){
                        if (data[params.dataIndex][1]>data[params.dataIndex][0]) {
                            colorList = self.color_style.s0CF49B;
                        } else {
                            colorList = self.color_style.sFD1050;
                        }
                        return colorList;
                    }
                    return '';
                }
            }
            return normal;
        },
        //初始化k线图配置
        initChart:function () { //初始化charts配置数据

            this.currency_option = {
                backgroundColor:'white',
                calculable: false,
                smooth: false,
                animation: false,
                dataZoom: [
                    {
                        type: 'inside',
                        xAxisIndex: [0, 1],
                        startValue: 0,
                        endValue: 100
                    }
                ],
                xAxis:[ {
                    type: 'category',
                    data: [],
                    // axisTick: false,
                    axisLabel:{
                        textStyle:{
                            fontSize:7
                        }
                    }

                }, {
                    axisTick:{
                        show:false
                    },
                    type: 'category',
                    gridIndex: 1,
                    data: [],
                    axisLabel: {show: false}
                }
                ],
                yAxis: [{

                }, {
                    name:'成交量',
                    nameTextStyle:{
                        fontSize:8
                    },
                    nameGap:0,
                    gridIndex: 1,
                    splitNumber: 3,
                    axisLine: {onZero: false},
                    axisTick: {show: false},
                    splitLine: {show: false},
                    axisLabel: {show: false}
                }
                ],
                grid:[ {
                    left: '20',
                    right: '15',
                    bottom: '25',
                    top:'15',
                    height:'200'
                },{
                    left: '20',
                    right: '15',
                    bottom: '25',
                    top:'260',
                    height:'60'
                }
                ],
                series:[
                    {
                        name: this.currency_select_ktype,
                        type: 'candlestick',
                        data: [],
                        itemStyle: {
                            normal: {
                                color: 'white',
                                color0: this.color_style.sFD1050,
                                borderColor: this.color_style.s0CF49B,
                                borderColor0: this.color_style.sFD1050,
                                borderWidth:0.5
                            }
                        },
                        markPoint: {
                            symbol:"pin",
                            symbolSize:1,
                            data:[],
                            label: {
                                normal: {
                                    formatter: function (param) {
                                        return param != null ? Math.round(param.value) : '';
                                    }
                                }
                            }
                        },
                        markLine: {

                            symbol: ['none', 'none'],
                            data:[]
                        }
                    },
                    {
                        name:"成交量",
                        type: 'bar',
                        xAxisIndex: 1,
                        yAxisIndex: 1,
                        data: [],
                        itemStyle: {
                            normal: {}
                        }
                    },
                    {
                        name: 'zc',
                        type: 'line',
                        data: [],
                        showSymbol: false,
                        lineStyle: {
                            normal: {color: this.color_style.s02c468,width:1}
                        }
                    },
                    {
                        name: 'zd',
                        type: 'line',
                        data: [],
                        showSymbol: false,
                        lineStyle: {
                            normal: {color: this.color_style.sed3368,width:1}
                        }
                    }
                ]


            }

        },

        //获取现在k线下的数组对象
        get_currency_kData:function () {
            return this.currency_request_kdata[this.currency_type][this.currency_select_ktype+this.currency_configs.kDataType];
        },
        //获取现在请求k线的参数
        get_currency_kParam:function () {
            return this.currency_request_kparam[this.currency_type][this.currency_select_ktype+this.currency_configs.kParamType];
        },
        //==========指标的处理函数=========
        //组织指标的参数
        product_indicator_param:function () {
            var indicator_param = {
                use_last:'on',
                symbol:this.currency_type,
                // line_type:this.currency_select_ktype,
                line_type:this.targetState,
                bar_interval:this.currency_select_ktype
            }
            return indicator_param;
        },
        //判断指标数据是否存在
        currency_indicator_is_exit:function () {
            var dataObject = this.get_currency_kData();
            if (dataObject.yData.length === 0 && dataObject.xDate.length === 0){ //k线数据不存在
                this.request_currency_data(this.get_currency_kParam(),dataObject);
            }else {//k线数据存在

                //判断指标数据是否存在 请求指标数据
                if(this.targetState === this.targetStateValue.fz){
                    if(dataObject.fzData.length > 0){
                        this.currency_option.series[0].markPoint.data=dataObject.fzData;
                        this.currency_option.series[0].markLine.data=dataObject.zcData;
                        this.product_k_option(dataObject);//画k线
                    }else {
                        this.request_indicator_data(this.product_indicator_param());
                    }
                }else if (this.targetState === this.targetStateValue.qs){
                    if(dataObject.qsData.length > 0){
                        this.currency_option.series[0].markPoint.data=dataObject.qsData;
                        this.product_k_option(dataObject);//画k线
                    }else {
                        this.request_indicator_data(this.product_indicator_param());
                    }
                }else if (this.targetState === this.targetStateValue.sp){
                    if (dataObject.spData.length > 0){
                        this.currency_option.series[0].markLine.data=dataObject.spData;
                        this.product_k_option(dataObject);//画k线
                    }else {
                        this.request_indicator_data(this.product_indicator_param());
                    }
                }
            }

        },
        //请求指标数据
        request_indicator_data:function (param) {
            if(this.fromType === 'kuayu'){
                this.request_kuayu_indecator_data();
            }else{
                var self = this;
                self.request_loading(true);
                $.ajax({
                    type:'get',
                    url:self.currency_server_target,
                    data:param,
                    success:function (data) {
                        if (data.code == 'OK'){
                           if(self.targetState === self.targetStateValue.qs){
                               self.handle_qs_Data(data,self.get_currency_kData());
                           }else if(self.targetState === self.targetStateValue.fz){
                               self.handle_fz_data(data,self.get_currency_kData());
                           }else if(self.targetState === self.targetStateValue.sp){
                               self.handle_sp_data(data,self.get_currency_kData());
                           }
    
                        }else{
                            self.request_loading_data()
                        }
                    },
                    error:function () {
                        self.request_loading_data()
                    }
                })
            }
           
        },
        request_kuayu_indecator_data:function(){
            var self = this;
            self.request_loading(true);
            $.ajax({
                type:'get',
                url:'/currency/kmagic',
                data:param,
                dataType: "JSONP",
                success:function (data) {
                    var _data = data;
                    if (_data.code == 'OK'){
                        if(self.targetState === self.targetStateValue.qs){
                            self.handle_qs_Data(_data,self.get_currency_kData());
                        }else if(self.targetState === self.targetStateValue.fz){
                            self.handle_fz_data(_data,self.get_currency_kData());
                        }else if(self.targetState === self.targetStateValue.sp){
                            self.handle_sp_data(_data,self.get_currency_kData());
                        }

                    }else{
                        self.request_loading_data()
                    }
                },
                error:function () {
                    self.request_loading_data()
                }
            })
        },
        //处理qs数据
        handle_qs_Data:function (_data,dataObject) {
            var self = this;
            var tempArray = [];
            var data = _data.data.data;
            data.push(data[data.length -1])
            var feature = data[0].feature;

            var same = 0;
            for(var i =0;i<data.length;i++){
                 var temp = data[i];
                 var trade_date = temp.trade_date;
                 if (trade_date === dataObject.xDate[0]){
                     same = i;
                     break;
                 }
            }
            data = data.slice(same)
            for(var i =0;i<data.length;i++){
                var temp = data[i];
                var yData,symbolOffset,symbolRotate;
                var trade_date = temp.trade_date;
                var url,coord,itemStyle;
                if(temp.feature == '-1.0'){
                    var index = dataObject.xDate.indexOf(trade_date);
                    if(index != -1){
                        yData = dataObject.yData[index][3];
                    }
                    url = '';
                    symbolOffset = [0,'-5px'];
                    symbolRotate = 180;
                    itemStyle= {
                        normal: {
                            color: 'white',
                            color0: self.color_style.sFD1050,
                            borderColor: self.color_style.sFD1050,
                            borderColor0: self.color_style.sFD1050,
                            borderWidth:0.5
                        }
                    }
                }
                if(temp.feature == '1.0'){
                    var index = dataObject.xDate.indexOf(trade_date);
                    if(index != -1){
                        if(dataObject.yData[index]){
                            yData = dataObject.yData[index][2];
                        }
                    }
                    url = '';
                    symbolOffset = [0,'60%'];
                    symbolRotate = 0;
                    itemStyle={
                        normal: {
                            color: 'white',
                            color0: self.color_style.s0CF49B,
                            borderColor: self.color_style.s0CF49B,
                            borderColor0: self.color_style.s0CF49B,
                            borderWidth:0.5
                        }
                    }
                }
                coord = [trade_date,yData];
                var colorObj={//k线颜色
                    value:dataObject.yData[i],
                    itemStyle:itemStyle
                }

                var obj = {
                    symbolSize:'6',
                    symbol:"image://http://mct.ap-coin.com/static/images/k-top.png",
                    symbolRotate:symbolRotate,
                    symbolOffset:symbolOffset,
                    coord:coord,
                    label:{
                        normal:{
                            show:true,
                            position:"top",
                            formatter:'{b}',
                            textStyle:{
                                fontStyle:"oblique",
                                color:'rgba(255,255,255,0)',

                            }
                        }
                    },
                    itemStyle: {
                        normal: {color: ''},

                    },
                }
                dataObject.yColorData.push(colorObj);
                tempArray.push(obj);
                if (i == 0 || feature != temp.feature){
                    if (i == 0){
                        dataObject.qsData.push(obj);
                    }
                    if (feature != temp.feature){
                        dataObject.qsData.push(tempArray[i]);
                    }
                    feature = temp.feature;
                }
            }
            dataObject.yColorData[dataObject.yColorData.length -1].itemStyle.normal = {
                color: '#999999',
                color0: '#999999',
                borderColor: '#999999',
                borderColor0: '#999999',
                borderWidth:0.5
            }

            self.currency_option.series[0].markPoint.data=dataObject.qsData;
            self.product_k_option(dataObject)
            self.request_loading(false);
        },

        handle_fz_data:function (_data,dataObject) {
            var self = this;
            var maxArray = _data.data.data;
            maxArray.push(maxArray[maxArray.length-1])
            var same = 0;
            for(var i =0;i<maxArray.length;i++){
                 var temp = maxArray[i];
                 var trade_date = temp.trade_date;
                 if (trade_date === dataObject.xDate[0]){
                     same = i;
                     break;
                 }
            }
            maxArray = maxArray.slice(same)
            var lengthArray = maxArray.length;
            for(var i=0;i<lengthArray;i++){
                var trade_date = maxArray[i].trade_date;
                var setup = maxArray[i].setup;
                var index = dataObject.xDate.indexOf(trade_date);
                if (setup != '' && index !=-1){
                    var intSetup = parseInt(setup);
                    var coord,value,color,position;
                    if (intSetup >0){
                        var y = dataObject.yData[index][3];
                        coord = [trade_date,y];
                        value = intSetup;
                        if (value == 9){
                            color = self.color_style.sFD1050
                        }else {
                            color = '#999999'
                        }
                        position = 'top';
                    }else if(setup < 0){
                        var y = dataObject.yData[index][2];
                        coord = [trade_date,y];
                        value = -intSetup;
                        if (value == 9){
                            color = self.color_style.s0CF49B
                        }else {
                            color = '#999999'
                        }
                        position = 'bottom';
                    }
                    var obj = {
                        coord:coord,
                        value:value,
                        itemStyle: {
                            normal: {color: color}
                        },
                        label:{
                            normal:{
                                position:position,
                                textStyle:{
                                    fontSize:'8'
                                }
                            }
                        }
                    }
                    dataObject.fzData.push(obj);
                }

                //支撑阻挡
                if(i <lengthArray -1){
                    var ZDArray = [];
                    var ZDOneObj = {};

                    var ZCArray = [];
                    var ZCOneObj = {};

                    var zhicheng = maxArray[i].TD_S;
                    var zudang = maxArray[i].TD_D;

                    if(zhicheng != maxArray[i+1].TD_S){
                        if(dataObject.zcData.length -2 >= 0){
                            dataObject.zcData[dataObject.zcData.length -2][0].name = '支撑线'
                        }
                    }else {
                        var oneArray = [maxArray[i].trade_date, zhicheng];
                        var towArray = [maxArray[i + 1].trade_date, zhicheng];
                        ZCOneObj = {
                            name: '',
                            coord: oneArray,
                            lineStyle: {
                                normal: {
                                    color: self.color_style.s02c468
                                }
                            }
                        };
                        var ZCTowObj = {
                            coord: towArray
                        }
                        ZCArray.push(ZCOneObj);
                        ZCArray.push(ZCTowObj);
                        dataObject.zcData.push(ZCArray);
                    }

                    if(zudang != maxArray[i+1].TD_D){
                        if(dataObject.zcData.length-2 >=0&&dataObject.zcData[dataObject.zcData.length -2][0].lineStyle.normal.color == self.color_style.sFD1050){
                            dataObject.zcData[dataObject.zcData.length -2][0].name = '阻挡线'
                        }
                    }else {
                        var oneArray = [maxArray[i].trade_date, zudang];
                        var towArray = [maxArray[i + 1].trade_date, zudang];
                        ZDOneObj = {
                            name: '',
                            coord: oneArray,
                            lineStyle: {
                                normal: {
                                    color: self.color_style.sFD1050
                                }
                            }
                        };
                        var ZDTowObj = {
                            coord: towArray
                        }
                        ZDArray.push(ZDOneObj);
                        ZDArray.push(ZDTowObj);
                        dataObject.zcData.push(ZDArray);
                    }
                }
            }
            self.currency_option.series[0].markPoint.data=dataObject.fzData;
            self.currency_option.series[0].markLine.data=dataObject.zcData;
            self.product_k_option(dataObject);
            self.request_loading(false);
        },

        handle_sp_data:function (_data,dataObject) {
            var maxArray = _data.data.data;
            var zc_color = '';
            var zd_color = '';
            var sp_color = 0;
            if(sp_color === 0){
                zc_color = this.color_style.s0CF49B;
                zd_color = this.color_style.sed3368;
            }else{
                zd_color = 'blue';
                zc_color = 'red';
            }



            var lengthArray = maxArray.length;
            for(var i=0;i<lengthArray;i++){

                if(i <lengthArray -1){
                    var ZDArray = [];
                    var ZDOneObj = {};

                    var ZCArray = [];
                    var ZCOneObj = {};

                    var zhicheng = maxArray[i].support;
                    var zudang = maxArray[i].block;

                    //支撑
                    var oneArray = [maxArray[i].trade_date, zhicheng];
                    var towArray = [maxArray[i + 1].trade_date, maxArray[i+1].support];

                    if (i == 0){
                        ZCOneObj = {
                            name: '',
                            coord: oneArray,
                            lineStyle: {
                                normal: {
                                    color: zc_color
                                }
                            },
                            label: {
                                normal: {show: true,position:'start'
                                    ,formatter:function(param){
                                        return param.name = '支撑线'
                                    }
                                }
                            }
                        }
                    }else {
                        ZCOneObj = {
                            name: '',
                            coord: oneArray,
                            lineStyle: {
                                normal: {
                                    color: zc_color
                                }
                            }
                        };
                    }
                    var ZCTowObj = {
                        coord: towArray
                    }
                    ZCArray.push(ZCOneObj);
                    ZCArray.push(ZCTowObj);
                    dataObject.spData.push(ZCArray);

                    var oneArrayZu = [maxArray[i].trade_date, zudang];
                    var towArrayZu = [maxArray[i + 1].trade_date, maxArray[i+1].block];
                    if(i == 0){
                        ZDOneObj = {
                            name: '',
                            coord: oneArrayZu,
                            lineStyle: {
                                normal: {
                                    color: zd_color
                                }
                            },
                            label: {
                                normal: {show: true,position:'start'
                                    ,formatter:function(param){
                                        return param.name = '阻挡线'
                                    }
                                }
                            }
                        }
                    }else {
                        ZDOneObj = {
                            name: '',
                            coord: oneArrayZu,
                            lineStyle: {
                                normal: {
                                    color: zd_color
                                }
                            },
                        }
                    }
                    var ZDTowObj = {
                        coord: towArrayZu
                    }
                    ZDArray.push(ZDOneObj);
                    ZDArray.push(ZDTowObj);
                    dataObject.spData.push(ZDArray);
                    //阻挡
                }
            }
            this.currency_option.series[0].markLine.data=dataObject.spData;
            this.product_k_option(dataObject);
            this.request_loading(false);
        },

        timeNumberChange:function (timestamp) {
            var d = new Date(timestamp*1000);    //根据时间戳生成的时间对象
            return date = (d.getFullYear()) + "/" +
                (d.getMonth() + 1) + "/" +
                (d.getDate()) + " " +
                (d.getHours()) + ":" +
                (d.getMinutes()) + ":" +
                (d.getSeconds());
        }
    }
   
  try{
    var kline = new CurrencyKLine({
        currency_k_id:'chart',
        currency_k_types:['5m','15m','30m','1h','2h','4h','6h','12h','1d'],
        currency_k_types_show:['5min','15min','30min','1hour','2hour','4hour','6hour','12hour','24hour'],

        currency_type_sources:[['btc_us'],['eth_btc','eth_us'],['xrp_btc'],['ltc_btc','ltc_us'],['eos_btc'],['ada_btc'],['xlm_btc'],['neo_btc','neo_us'],
            ['xmr_btc'],

            ],
        currency_type_sources_show:[['BTC/USD'],['ETH/BTC','ETH/USD'],['XRP/BTC'],['LTC/BTC','LTC/USD'],['EOS/BTC'],['ADA/BTC'],['XLM/BTC'],['NEO/BTC','NEO/USD']
            ,['XMR/BTC'],

        ],
        fromType:''
    })
    kline.currency_init();
  }catch(e){
      
  }

})



