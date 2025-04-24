import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as echarts from 'echarts';

export default {
    name: 'radarCharts',
    label: '雷达图',
    create: function (storage, { transformControls }) {
        const container = document.createElement("div");
        container.style.width = "300px";
        container.style.height = "200px";

        var myChart = echarts.init(container);
        var option;
        
        option = {
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          color: ['#67F9D8', '#FFE434', '#56A3F1'],
          tooltip: {
            trigger: 'item'
          },
          legend: {
            top: '5%',
            left: 'center',
            textStyle: {
              color: '#333'
            }
          },
          radar: {
            indicator: [
              { name: '销售', max: 10000 },
              { name: '管理', max: 10000 },
              { name: '信息技术', max: 10000 },
              { name: '客服', max: 10000 },
              { name: '研发', max: 10000 },
              { name: '市场', max: 10000 }
            ],
            shape: 'circle',
            splitNumber: 5,
            axisName: {
              color: '#333'
            },
            splitLine: {
              lineStyle: {
                color: [
                  'rgba(238, 197, 102, 0.1)',
                  'rgba(238, 197, 102, 0.2)',
                  'rgba(238, 197, 102, 0.4)',
                  'rgba(238, 197, 102, 0.6)',
                  'rgba(238, 197, 102, 0.8)',
                  'rgba(238, 197, 102, 1)'
                ].reverse()
              }
            },
            splitArea: {
              show: false
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(238, 197, 102, 0.5)'
              }
            }
          },
          series: [
            {
              name: '预算分配',
              type: 'radar',
              emphasis: {
                lineStyle: {
                  width: 4
                }
              },
              data: [
                {
                  value: [4200, 3000, 8000, 3500, 5000, 7000],
                  name: '预算分配',
                  areaStyle: {
                    color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
                      {
                        color: 'rgba(103, 249, 216, 0.6)',
                        offset: 0
                      },
                      {
                        color: 'rgba(103, 249, 216, 0.1)',
                        offset: 1
                      }
                    ])
                  }
                },
                {
                  value: [5000, 7000, 4000, 6000, 3000, 8000],
                  name: '实际开销',
                  areaStyle: {
                    color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
                      {
                        color: 'rgba(255, 228, 52, 0.6)',
                        offset: 0
                      },
                      {
                        color: 'rgba(255, 228, 52, 0.1)',
                        offset: 1
                      }
                    ])
                  }
                }
              ]
            }
          ]
        };
        
        option && myChart.setOption(option);

        const mesh = new CSS2DObject(container);
        return mesh;
    },
};
