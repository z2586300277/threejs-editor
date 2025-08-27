import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as echarts from 'echarts';

// 导出组件定义
export default {
  name: 'pieCharts',

  label: '饼图',

  // 创建组件
  create: function (storage, { transformControls }) {
    // 创建根容器
    const container = document.createElement("div");
    container.style.width = "300px";
    container.style.height = "200px";

    var myChart = echarts.init(container);
    var option;

    option = {
      backgroundColor: 'transparent',
      color: ['#80FFA5', '#00DDFF', '#37A2FF', '#FFBF00', '#FF6B6B'],
      tooltip: {
        show: false
      },
      legend: {
        top: '5%',
        left: 'center',
        textStyle: {
          color: 'rgba(255, 255, 255, 0.8)'
        }
      },
      series: [
        {
          name: '数据分布',
          type: 'pie',
          radius: ['40%', '70%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 10,
            borderColor: 'transparent',
            borderWidth: 0,
            opacity: 0.8
          },
          label: {
            show: false,
            position: 'center'
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 20,
              fontWeight: 'bold',
              color: 'rgba(255, 255, 255, 0.8)'
            }
          },
          labelLine: {
            show: false
          },
          data: [
            { value: 1048, name: 'Three.js' },
            { value: 484, name: 'Cesium.js' },
            { value: 300, name: 'Babylon.js' }
          ]
        }
      ]
    };

    option && myChart.setOption(option)

    // 构建CSS2D对象
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
