$(function() {
  var CurrencyKLine = function(configs) {
    this.currency_chart = {}; //myChart
    this.currency_option = {}; //option
    this.currency_request_kparam = {}; //paraObject

    // this.fromType = configs.fromType; //区分是不是跨域来的
    this.currency_k_intervals = configs.currency_k_intervals; //k 类型资源
    this.currency_okex_api = "/api/kline/okex/future";
    // this.currency_server_target = "/currency/kmagic";

    this.currency_type = configs.currency_type_sources[0][0]; //那种数字货币
    this.currency_k_id = configs.currency_k_id; //id
    this.currency_type_sources = configs.currency_type_sources; //数字货币的种类

    this.currency_configs = {
      classType: "_class"
    };
    this.currency_request_kdata = {}; //请求k的数据存放对象  weekObject
    this.targetState = ""; //区分指标的状态
    this.targetStateValue = {
      qs: "golden_finger" //神奇趋势
    };
    this.currency_k_interval = this.currency_k_intervals[0]; //选中的哪种货币k线类型
    //关于指标的属性
    this.color_style = {
      s0CF49B: "#0CF49B",
      sFD1050: "#FD1050",
      s02c468: "#02c468",
      sed3368: "#ed3368"
    };

    this.newPrie = "----";
    this.setTimer = null;
  };

  CurrencyKLine.prototype = {
    currency_init: function() {
      //初始化该对象   初始化k线图
      this.currency_chart = echarts.init(
        document.getElementById(this.currency_k_id)
      );
      this.initChart();
      this.currency_chart.setOption(this.currency_option);
      this.currency_html();
      this.refresh_data();
    },
    //组织数字货币强求参数对象 与k线值对象
    product_currency_param: function() {
      var self = this;
      //symbol=f_usd_btc&type=1min&contract_type=quarter&size=100

      this.currency_type_sources.forEach(function(contract_list) {
        contract_list.forEach(function(contract) {
          self.currency_request_kparam[contract] = {};
          self.currency_request_kdata[contract] = {};
          self.currency_k_intervals.forEach(function(interval) {
            var body = {
              contract: contract,
              interval: interval
            };
            self.currency_request_kparam[contract][interval] = body;
            var data_value = {
              type: interval,
              xDate: [],
              yData: [],
              volumnData: [],
              currencyVolumnData: [],
              indexData: [],
              yColorData: []
            };
            self.currency_request_kdata[contract][interval] = data_value;
          });
        });
      });
    },
    currency_html: function() {
      //添加UI
      var self = this;

      $(".symbol-type").text(self.currency_type_sources[0][0] + "实时行情");
      //数字货币种类切换
      var coin_show = false;
      var coin_str = "";
      var coin_sources = this.currency_type_sources;
      this.currency_type_sources.forEach(function(values, indexs) {
        if (values.length === 1) {
          coin_str += '<div class="one-coin-type">';
        } else {
          coin_str += '<div class="tow-coin-type">';
        }

        values.forEach(function(value, index) {
          coin_str +=
            "<li class=" + value + " >" + coin_sources[indexs][index] + "</li>";
        });
        coin_str += "</div>";
      });
      $(".coin_list_ul").append(coin_str);
      $(".coin_list_ul li").on("click tap", function() {
        coin_show = false;
        var class_name = $(this).attr("class");

        $(".coin_type_tag").attr("src", "./static/images/bottom_1.png");
        $(".coin_list_ul").hide();

        if (self.currency_type === class_name) {
          return;
        }
        $(".coin-type span").text($(this).text() + "实时行情");
        self.currency_type = class_name;
        self.refresh_data();
      });

      $(".coin-type").on("click tap", function() {
        $(".coin_list_ul").toggle();
        if (coin_show) {
          coin_show = false;
          $(".coin_type_tag").attr("src", "./static/images/bottom_1.png");
        } else {
          coin_show = true;
          $(".coin_type_tag").attr("src", "./static/images/top_1.png");
        }
      });

      //分钟切换
      var str = "";
      this.currency_k_intervals.forEach(function(value, index) {
        var className = value + "_class";
        str += "<li class=" + className + " >" + value + "</li>";
      });
      $(".list_ul").append(str);
      $(".list_ul li:nth-child(2)").css("color", "#1d73d3");
      var show = false;
      $(".list_ul li").on("click tap", function() {
        var interval = $(this)
          .attr("class")
          .split("_")[0];

        $(".list_ul").toggle();
        show = false;
        $(".list_button_tag").attr("src", "./static/images/bottom_2.png");

        if (self.currency_k_interval === interval) {
          return;
        }
        self.currency_k_interval = interval;
        $(".list_ul li").css("color", "#333333");
        $(this).css("color", "#1d73d3");
        $(".list_button span").text($(this).text());
        self.refresh_data();
      });

      $(".list_button").click("tap click", function() {
        $(".list_ul").toggle();
        if (show) {
          show = false; //隐藏
          $(".list_button_tag").attr("src", "./static/images/bottom_2.png");
        } else {
          show = true; //显示
          $(".list_button_tag").attr("src", "./static/images/top_3.png");
        }
      });
      $(".target").on("click tap", function() {
        $(".target").removeClass("select-target");
        $(".introduce").hide();
        if (self.targetState == $(this).attr("name")) {
          self.targetState = "";
          self.initChart();
          return;
        } else if (self.targetState == "") {
          $(this).addClass("select-target");
          self.targetState = $(this).attr("name");
        } else {
          $(this).addClass("select-target");
          self.targetState = $(this).attr("name");
          self.initChart();
          self.currency_chart.setOption(self.currency_option);
        }
        $("div[tag=" + $(this).attr("name") + "]").show();
      });
      var time_html =
        "<div class='time_content' style='color:#222222'><span class='new-price'><span class='header'></span><span class='middle'></span><span style='color:#707070'><span class='miao'>--</span>秒后更新数据</span></div>";
      $(".content").append(time_html);
    },
    refresh_data: function() {
      this.product_currency_param();
      this.request_currency_data(this.get_currency_kParam());
      clearInterval(this.setTimer);
    },
    //定时请求数据
    setTimerAction() {
      var self = this;
      clearInterval(self.setTimer);
      var total = 30;
      this.setTimer = setInterval(function() {
        $(".miao").text(total);
        if (total == 0) {
          self.refresh_data();
        } else {
          total = total - 1;
        }
      }, 1000);
    },
    //数字货币k线数据请求
    request_currency_data: function(param) {
      var self = this;
      self.request_loading(true);
      $.ajax({
        type: "get",
        url: self.currency_okex_api,
        data: param,
        success: function(data) {
          if (data.errorcode == 0) {
            self.currency_handleData(data.data);
          } else {
            self.request_loading_data();
          }
        },
        error: function() {}
      });
    },
    //数字货币k线数据处理
    currency_handleData: function(data) {
      var self = this;
      if (data.length == 0) {
        self.request_loading_data();
        return;
      }
      var dataObject = self.get_currency_kData();
      data.forEach(item => {
        dataObject.xDate.push(item[0]);
        var yData = item.slice(1, 5);
        dataObject.yData.push(yData);
        dataObject.volumnData.push(item[5]);
        dataObject.currencyVolumnData.push(item[6]);
        if (item[7] == -1) {
          var yCoord = yData[3];
          symbolOffset = [0, "-5px"];
          symbolRotate = 180;
          itemStyle = {
            normal: {
              color: "white",
              color0: self.color_style.sFD1050,
              borderColor: self.color_style.sFD1050,
              borderColor0: self.color_style.sFD1050,
              borderWidth: 0.5
            }
          };
        } else {
          var yCoord = yData[2];
          symbolOffset = [0, "60%"];
          symbolRotate = 0;
          itemStyle = {
            normal: {
              color: "white",
              color0: self.color_style.s0CF49B,
              borderColor: self.color_style.s0CF49B,
              borderColor0: self.color_style.s0CF49B,
              borderWidth: 0.5
            }
          };
        }
        var colorObj = {
          value: yData,
          itemStyle: itemStyle
        };
        dataObject.yColorData.push(colorObj);
        var obj = {
          symbolSize: "6",
          symbol: "image://./static/images/k-top.png",
          symbolRotate: symbolRotate,
          symbolOffset: symbolOffset,
          coord: [item[0], yCoord],
          label: {
            normal: {
              show: true,
              position: "top",
              formatter: "{b}",
              textStyle: {
                fontStyle: "oblique",
                color: "rgba(255,255,255,0)"
              }
            }
          },
          itemStyle: {
            normal: { color: "" }
          }
        };
        dataObject.indexData.push(obj);
      });
      self.product_k_option(dataObject);
      self.request_loading(false);
      if (!this.start) {
        $(".target-qs").click();
        this.start = true;
      }
      //获取最新价格 更新到UI上
      self.handle_settime_title(dataObject);
    },
    //
    handle_settime_title: function(dataObject) {
      var self = this;
      // 最后一个价格不完整 不显示
      var oldValue = dataObject.yData[dataObject.yData.length - 3][1];
      var newValue = dataObject.yData[dataObject.yData.length - 2][1];
      document.title =
        "$" +
        newValue +
        "-" +
        self.currency_type.split("-")[0] +
        "-" +
        self.currency_k_interval +
        "|看盘平台";
      if (newValue > oldValue) {
        $(".new-price .header").css("color", "#008000");
      } else if (newValue === oldValue) {
        $(".new-price .header").css("color", "#333333");
      } else {
        $(".new-price .header").css("color", "#ff0000");
      }
      $(".new-price .header").text(newValue + "   ");
      self.setTimerAction();
    },
    // 组装k线数据
    product_k_option: function(dataObject) {
      var self = this;
      self.currency_option.xAxis[0].data = dataObject.xDate;
      self.currency_option.xAxis[1].data = dataObject.xDate;
      self.currency_option.series[1].data = dataObject.volumnData;
      self.currency_option.series[1].itemStyle.normal = self.currency_setBarStyle(
        dataObject.yData
      );
      self.currency_option.series[0].data = dataObject.yColorData;
      self.currency_option.series[0].markPoint.data = dataObject.indexData;

      if (dataObject.yData.length < 70) {
        self.currency_option.dataZoom[0].startValue = dataObject.yData.length;
      } else {
        self.currency_option.dataZoom[0].startValue =
          dataObject.yData.length - 70;
        self.currency_option.dataZoom[0].endValue = dataObject.yData.length;
      }
      if (dataObject.yData[0][0] < 0.0001) {
        self.currency_option.yAxis[0] = {
          type: "value",
          scale: true,
          splitArea: {
            show: true,
            interval: 1
          },
          interval: "auto",
          axisLabel: {
            textStyle: {
              fontSize: 7
            },
            inside: true,
            margin: 4
          },
          axisTick: false
        };
      } else {
        self.currency_option.yAxis[0] = {
          type: "value",
          scale: true,
          splitArea: {
            show: true,
            interval: 1
          },
          splitNumber: 4,
          axisLabel: {
            textStyle: {
              fontSize: 7
            },
            inside: true,
            margin: 4
          },
          axisTick: false
        };
      }
      self.currency_chart.setOption(self.currency_option);
    },
    //loading 图
    request_loading: function(bool) {
      $(".cover").css("marginTop", "0px");
      $(".cover div").css("top", "180px");
      if (bool) {
        $(".cover").css("display", "block");
      } else {
        $(".cover").css("display", "none");
      }
    },
    request_loading_data: function() {
      $(".cover").css("marginTop", "80px");
      $(".cover div").css("top", "100px");
      $(".cover div").text("暂无数据");
    },
    //设置柱状图颜色
    currency_setBarStyle: function(data) {
      var self = this;
      var normal = {
        color: function(params) {
          var colorList;
          if (data[params.dataIndex]) {
            if (data[params.dataIndex][1] > data[params.dataIndex][0]) {
              colorList = self.color_style.s0CF49B;
            } else {
              colorList = self.color_style.sFD1050;
            }
            return colorList;
          }
          return "";
        }
      };
      return normal;
    },
    //初始化k线图配置
    initChart: function() {
      //初始化charts配置数据

      this.currency_option = {
        backgroundColor: "white",
        calculable: false,
        smooth: true,
        animation: true,
        dataZoom: [
          {
            type: "inside",
            xAxisIndex: [0, 1],
            startValue: 0,
            endValue: 100
          }
        ],
        xAxis: [
          {
            type: "category",
            data: [],
            // axisTick: false,
            axisLabel: {
              textStyle: {
                fontSize: 7
              }
            }
          },
          {
            axisTick: {
              show: false
            },
            type: "category",
            gridIndex: 1,
            data: [],
            axisLabel: { show: false }
          }
        ],
        yAxis: [
          {},
          {
            name: "成交量",
            nameTextStyle: {
              fontSize: 8
            },
            nameGap: 0,
            gridIndex: 1,
            splitNumber: 3,
            axisLine: { onZero: false },
            axisTick: { show: false },
            splitLine: { show: false },
            axisLabel: { show: false }
          }
        ],
        grid: [
          {
            left: "20",
            right: "15",
            bottom: "25",
            top: "15",
            height: "200"
          },
          {
            left: "20",
            right: "15",
            bottom: "25",
            top: "260",
            height: "60"
          }
        ],
        series: [
          {
            name: this.currency_k_interval,
            type: "candlestick",
            data: [],
            itemStyle: {
              normal: {
                color: "white",
                color0: this.color_style.sFD1050,
                borderColor: this.color_style.s0CF49B,
                borderColor0: this.color_style.sFD1050,
                borderWidth: 0.5
              }
            },
            markPoint: {
              symbol: "pin",
              symbolSize: 1,
              data: [],
              label: {
                normal: {
                  formatter: function(param) {
                    return param != null ? Math.round(param.value) : "";
                  }
                }
              }
            },
            markLine: {
              symbol: ["none", "none"],
              data: []
            }
          },
          {
            name: "成交量",
            type: "bar",
            xAxisIndex: 1,
            yAxisIndex: 1,
            data: [],
            itemStyle: {
              normal: {}
            }
          },
          {
            name: "zc",
            type: "line",
            data: [],
            showSymbol: false,
            lineStyle: {
              normal: { color: this.color_style.s02c468, width: 1 }
            }
          },
          {
            name: "zd",
            type: "line",
            data: [],
            showSymbol: false,
            lineStyle: {
              normal: { color: this.color_style.sed3368, width: 1 }
            }
          }
        ]
      };
    },

    //获取现在k线下的数组对象
    get_currency_kData: function() {
      return this.currency_request_kdata[this.currency_type][
        this.currency_k_interval
      ];
    },
    //获取现在请求k线的参数
    get_currency_kParam: function() {
      return this.currency_request_kparam[this.currency_type][
        this.currency_k_interval
      ];
    }
  };

  try {
    var kline = new CurrencyKLine({
      currency_k_id: "chart",
      currency_k_intervals: ["1m", "5m", "30m", "1h"],
      currency_type_sources: [["BTC-USD-191227"], ["ETH-USD-191227"]]
    });
    kline.currency_init();
  } catch (e) {}
});
