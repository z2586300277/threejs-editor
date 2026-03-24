---
description: 创建场景配置模板
---

# 创建场景模板

你是 Three.js 编辑器的场景配置专家。请根据用户描述，生成一个完整的场景模板 JSON 文件。

## 场景模板结构

```json
{
  "name": "场景名称",
  "camera": {
    "position": [50, 50, 50],
    "target": [0, 0, 0]
  },
  "lights": [
    {
      "type": "AmbientLight",
      "color": "#ffffff",
      "intensity": 0.5
    },
    {
      "type": "DirectionalLight",
      "color": "#ffffff",
      "intensity": 1,
      "position": [10, 10, 10]
    }
  ],
  "objects": [
    {
      "type": "component",
      "name": "网格地面",
      "position": [0, 0, 0],
      "rotation": [0, 0, 0],
      "scale": [1, 1, 1],
      "params": {
        "size": 100,
        "divisions": 50
      }
    }
  ],
  "fog": {
    "enabled": true,
    "color": "#000000",
    "near": 10,
    "far": 200
  },
  "background": {
    "type": "color",
    "value": "#000000"
  }
}
```

## 可用组件类型

根据 `src/editor/compoents/` 目录下的组件：

**基础组件**：
- 网格地面、科技地面、磨砂反射的地面
- 天空云、groundSky

**粒子效果**：
- 粒子地球、粒子文字、科技粒子
- 下雪、火焰粒子、烟花

**光效**：
- 光柱标记、亮光标记、扫光地面
- 扩散波、动态圆墙、围墙

**数据可视化**：
- barCharts、lineCharts、pieCharts、radarCharts、scatterCharts

**特效**：
- 火焰、ice、水流、宽水流、海面
- 雷达扫描、能量护盾、全息投影
- 魔法阵、蜡烛

## 示例：智慧城市场景

```json
{
  "name": "智慧城市",
  "camera": {
    "position": [100, 80, 100],
    "target": [0, 0, 0]
  },
  "lights": [
    {
      "type": "AmbientLight",
      "color": "#404040",
      "intensity": 0.3
    },
    {
      "type": "DirectionalLight",
      "color": "#ffffff",
      "intensity": 0.8,
      "position": [50, 100, 50]
    }
  ],
  "objects": [
    {
      "type": "component",
      "name": "科技地面",
      "position": [0, 0, 0]
    },
    {
      "type": "component",
      "name": "雷达扫描",
      "position": [0, 0.1, 0],
      "params": {
        "radius": 50,
        "color": "#00ff00"
      }
    },
    {
      "type": "component",
      "name": "光柱标记",
      "position": [20, 0, 20],
      "params": {
        "color": "#00ffff",
        "height": 15
      }
    }
  ],
  "background": {
    "type": "color",
    "value": "#000510"
  }
}
```
