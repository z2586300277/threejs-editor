---
description: 创建 ECharts 数据可视化组件
---

# 创建 ECharts 图表组件

你是 Three.js + ECharts 数据可视化专家。请根据用户描述，生成一个将 ECharts 图表渲染到 3D 场景中的编辑器组件。

## 图表组件模板

```javascript
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import * as echarts from 'echarts';

export default {
    name: 'chartName',
    label: '图表名称',

    create(storage, { transformControls }) {
        const container = document.createElement("div");
        container.style.width = "300px";
        container.style.height = "200px";

        const myChart = echarts.init(container);
        const option = {
            backgroundColor: 'transparent',
            color: ['#80FFA5', '#00DDFF', '#37A2FF'],
            tooltip: { trigger: 'axis' },
            legend: {
                data: ['数据1'],
                textStyle: { color: 'rgba(255, 255, 255, 0.8)' }
            },
            xAxis: {
                type: 'category',
                data: ['周一', '周二', '周三', '周四', '周五'],
                axisLine: { lineStyle: { color: 'rgba(255, 255, 255, 0.8)' } }
            },
            yAxis: {
                type: 'value',
                splitLine: { show: false },
                axisLabel: { color: 'rgba(255, 255, 255, 0.8)' }
            },
            series: [{
                name: '数据1',
                type: 'line',
                data: [120, 200, 150, 80, 70]
            }]
        };

        myChart.setOption(option);

        // 点击切换编辑模式
        container.addEventListener('click', () => {
            container.style.pointerEvents = 'none';
            transformControls.attach(mesh);
        });

        const mesh = new CSS2DObject(container);
        mesh.ADDCALL = function () {
            container.style.pointerEvents = 'auto';
        };

        mesh.onRemoveCall = () => {
            myChart.dispose();
        };

        return mesh;
    }
};
```

## 图表类型

- **折线图**：`type: 'line'`
- **柱状图**：`type: 'bar'`
- **饼图**：`type: 'pie'`
- **雷达图**：`type: 'radar'`
- **散点图**：`type: 'scatter'`

## 关键要点

1. **透明背景**：`backgroundColor: 'transparent'`
2. **暗色主题**：使用 `rgba(255, 255, 255, 0.8)` 作为文字颜色
3. **交互控制**：通过 `pointerEvents` 切换编辑/交互模式
4. **资源清理**：必须调用 `myChart.dispose()`
