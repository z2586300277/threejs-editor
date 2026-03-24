---
description: Three.js 编辑器开发指南
---

# Three.js Editor 开发指南

完整的 Three.js 编辑器项目开发技能集。

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
├── editor/
│   ├── compoents/        # 组件库
│   ├── index.vue         # 编辑器主界面
│   ├── left.vue          # 左侧面板
│   ├── right.vue         # 右侧面板
│   ├── editor.vue        # 3D 场景
│   ├── lib.js            # 工具函数
│   └── indexDb.js        # 本地存储
```

## 可用 Skills

- `/create-component` - 创建 3D 组件
- `/create-shader` - 创建 Shader 特效
- `/create-chart` - 创建数据可视化
- `/create-template` - 创建场景模板
- `/create-animation` - 创建动画效果
- `/fix-component` - 修复组件问题
- `/review-component` - 审查代码质量
- `/optimize-performance` - 性能优化
- `/add-postprocessing` - 添加后处理
- `/add-physics` - 集成物理引擎

## 核心 API

### ThreeEditor 实例

```javascript
const threeEditor = {
    scene,              // THREE.Scene
    camera,             // THREE.Camera
    renderer,           // THREE.WebGLRenderer
    controls,           // OrbitControls
    transformControls   // TransformControls
};
```

### 组件接口

```javascript
export default {
    name: 'componentName',
    label: '显示名称',
    initParameters: {},
    create(storage, threeEditor) {},
    getStorage(mesh) {},
    setStorage(mesh, storage) {}
};
```

## 开发规范

1. **命名规范**：使用中文命名组件文件
2. **资源清理**：必须实现 `onRemoveCall`
3. **参数存储**：使用 `mesh.userData.params`
4. **动画循环**：使用 `scene.addUpdateListener`

## 常用资源

- 模型库：`https://z2586300277.github.io/3d-file-server/`
- 纹理库：`https://z2586300277.github.io/three-cesium-examples/files/images/`
- 官方文档：https://threejs.org/docs/
