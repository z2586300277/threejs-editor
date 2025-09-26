import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as echarts from 'echarts';

export default {
    name: 'barCharts',
    label: '柱状图',
    create: function (storage, { transformControls }) {
        const container = document.createElement("div");
        container.style.width = "300px";
        container.style.height = "200px";

        var myChart = echarts.init(container);
        var option;
        
        option = {
          // 与 lineCharts 保持一致的暗色透明背景与配色
          backgroundColor: 'transparent',
          color: ['#80FFA5', '#00DDFF', '#37A2FF'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          legend: {
            data: ['销售额'],
            textStyle: {
              color: 'rgba(255, 255, 255, 0.8)'
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
            data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            axisTick: {
              alignWithLabel: true
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(255, 255, 255, 0.8)'
              }
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.8)'
            }
          },
          yAxis: {
            type: 'value',
            splitLine: {
              show: false
            },
            axisLabel: {
              color: 'rgba(255, 255, 255, 0.8)'
            }
          },
          series: [
            {
              name: '销售额',
              type: 'bar',
              barWidth: '60%',
              data: [120, 200, 150, 80, 70, 110, 130],
              itemStyle: {
                borderRadius: [4, 4, 0, 0],
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#37A2FF' },
                  { offset: 0.5, color: '#00DDFF' },
                  { offset: 1, color: 'rgba(0, 221, 255, 0.4)' }
                ])
              },
              emphasis: {
                itemStyle: {
                  color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                    { offset: 0, color: '#00DDFF' },
                    { offset: 0.7, color: '#00DDFF' },
                    { offset: 1, color: '#80FFA5' }
                  ])
                }
              }
            }
          ]
        };
        
        option && myChart.setOption(option);

        // 与 lineCharts 一致的可编辑交互流程
        container.addEventListener('click', (event) => {
          container.style.pointerEvents = 'none';
          transformControls.attach(mesh);
        });

        const mesh = new CSS2DObject(container);
        mesh.ADDCALL = function () {
          container.style.pointerEvents = 'auto';
        }
        return mesh;
    },
};
