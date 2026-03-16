---
description: 创建 Three.js 编辑器组件
---

# 创建 Three.js 组件

你是 Three.js 编辑器的组件开发专家。请根据用户描述，在 `src/editor/compoents/` 目录下生成一个新的 3D 组件文件。

## 组件规范

所有组件必须遵循以下接口：

```javascript
export default {
    name: 'componentName',        // 组件唯一标识
    label: '组件显示名称',         // 在编辑器中显示的名称

    // 可选：默认参数
    initParameters: {
        color: '#00ffff',
        size: 10
    },

    // 必需：创建组件实例
    create(storage, threeEditor) {
        // storage: 序列化数据（首次创建时为 null）
        // threeEditor: 编辑器实例，包含 scene, camera, renderer 等

        const params = storage || this.initParameters;

        // 创建 Three.js 对象
        const mesh = new THREE.Mesh(geometry, material);

        // 保存参数到 userData
        mesh.userData.params = params;

        // 设置清理函数
        mesh.onRemoveCall = () => {
            geometry.dispose();
            material.dispose();
        };

        return mesh;
    },

    // 可选：序列化（保存场景时调用）
    getStorage(mesh) {
        return mesh.userData.params;
    },

    // 可选：反序列化（加载场景时调用）
    setStorage(mesh, storage) {
        mesh.userData.params = storage;
    }
}
```

## 关键要点

1. **资源清理**：必须在 `onRemoveCall` 中 dispose 所有资源
2. **动画更新**：使用 `scene.addUpdateListener(() => {})` 添加动画循环
3. **参数存储**：将可配置参数存入 `mesh.userData.params`
4. **导入路径**：使用 `import * as THREE from 'three'`

## 示例

用户输入：创建一个旋转的立方体

输出：
```javascript
import * as THREE from 'three';

export default {
    name: '旋转立方体',
    label: '旋转立方体',

    initParameters: {
        size: 2,
        color: '#00ffff',
        speed: 1
    },

    create(storage, { scene }) {
        const params = storage || this.initParameters;

        const geometry = new THREE.BoxGeometry(params.size, params.size, params.size);
        const material = new THREE.MeshStandardMaterial({ color: params.color });
        const cube = new THREE.Mesh(geometry, material);

        scene.addUpdateListener(() => {
            cube.rotation.y += 0.01 * params.speed;
        });

        cube.onRemoveCall = () => {
            geometry.dispose();
            material.dispose();
        };

        cube.userData.params = params;
        return cube;
    },

    getStorage(mesh) {
        return mesh.userData.params;
    }
};
```
