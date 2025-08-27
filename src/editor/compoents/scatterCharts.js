import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import * as echarts from 'echarts';

export default {
  name: 'scatterCharts',
  label: '散点图',
  create: function (storage, { transformControls }) {
    const container = document.createElement("div");
    container.style.width = "300px";
    container.style.height = "200px";

    var myChart = echarts.init(container);
    var option;

    const data = [[10.0, 8.04, 50], [8.07, 6.95, 80], [13.0, 7.58, 60],
    [9.05, 8.81, 90], [11.0, 8.33, 40], [14.0, 7.66, 70],
    [13.4, 6.81, 35], [10.0, 6.33, 85]];

    option = {
      backgroundColor: 'transparent',
      tooltip: {
        show: false
      },
      grid: {
        left: '3%',
        right: '7%',
        bottom: '7%',
        top: '7%',
        containLabel: true
      },
      xAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.8)'
          }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.8)'
        },
        splitLine: {
          show: false
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: 'rgba(255, 255, 255, 0.8)'
          }
        },
        axisLabel: {
          color: 'rgba(255, 255, 255, 0.8)'
        },
        splitLine: {
          show: false
        }
      },
      visualMap: {
        show: false,
        min: 30,
        max: 90,
        dimension: 2,
        inRange: {
          color: ['#5470c6', '#91cc75', '#fac858', '#ee6666']
        }
      },
      series: [
        {
          name: '气泡图',
          type: 'scatter',
          symbolSize: function (data) {
            return data[2] / 4;
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          },
          itemStyle: {
            opacity: 0.8,
            borderColor: '#fff',
            borderWidth: 1,
            shadowBlur: 5,
            shadowColor: 'rgba(0, 0, 0, 0.3)'
          },
          data: data
        }
      ]
    };

    option && myChart.setOption(option);

    container.addEventListener('click', (event) => {
      container.style.pointerEvents = 'none';
      transformControls.attach(mesh);
    });

    const mesh = new CSS3DObject(container);
    mesh.ADDCALL = function () {
      container.style.pointerEvents = 'auto';
    }
    return mesh;
  },
};

