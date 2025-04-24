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
          tooltip: {
            trigger: 'item'
          },
          legend: {
            top: '5%',
            left: 'center'
          },
          series: [
            {
              name: 'Access From',
              type: 'pie',
              radius: ['40%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: '#fff',
                borderWidth: 2
              },
              label: {
                show: false,
                position: 'center'
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 40,
                  fontWeight: 'bold'
                }
              },
              labelLine: {
                show: false
              },
              data: [
                { value: 1048, name: 'Search Engine' },
                { value: 735, name: 'Direct' },
                { value: 580, name: 'Email' },
                { value: 484, name: 'Union Ads' },
                { value: 300, name: 'Video Ads' }
              ]
            }
          ]
        };
        
        option && myChart.setOption(option)

        // 构建CSS2D对象
        const mesh = new CSS2DObject(container);
        

        return mesh;
    },

};
