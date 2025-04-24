import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as echarts from 'echarts';

export default {
    name: 'lineCharts',
    label: '折线图',
    create: function (storage, { transformControls }) {
        const container = document.createElement("div");
        container.style.width = "300px";
        container.style.height = "200px";

        var myChart = echarts.init(container);
        var option;
        
        option = {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          color: ['#80FFA5', '#00DDFF', '#37A2FF'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross',
              label: {
                backgroundColor: '#6a7985'
              }
            }
          },
          legend: {
            data: ['数据1', '数据2', '数据3'],
            textStyle: {
              color: '#333'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            boundaryGap: false,
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            axisLine: {
              lineStyle: {
                color: '#999'
              }
            }
          },
          yAxis: {
            type: 'value',
            splitLine: {
              lineStyle: {
                type: 'dashed',
                color: '#DDD'
              }
            }
          },
          series: [
            {
              name: '数据1',
              type: 'line',
              stack: '总量',
              smooth: true,
              lineStyle: {
                width: 0
              },
              showSymbol: false,
              areaStyle: {
                opacity: 0.8,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(128, 255, 165, 0.7)' },
                  { offset: 1, color: 'rgba(128, 255, 165, 0.1)' }
                ])
              },
              emphasis: {
                focus: 'series'
              },
              data: [140, 232, 101, 264, 90, 340, 250]
            },
            {
              name: '数据2',
              type: 'line',
              stack: '总量',
              smooth: true,
              lineStyle: {
                width: 0
              },
              showSymbol: false,
              areaStyle: {
                opacity: 0.8,
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(0, 221, 255, 0.7)' },
                  { offset: 1, color: 'rgba(0, 221, 255, 0.1)' }
                ])
              },
              emphasis: {
                focus: 'series'
              },
              data: [120, 282, 111, 234, 220, 340, 310]
            }
          ]
        };
        
        option && myChart.setOption(option);

        const mesh = new CSS2DObject(container);
        return mesh;
    },
};
