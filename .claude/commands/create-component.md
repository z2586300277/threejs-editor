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

    // 必需：创建组件实例
    create(storage, { scene }) {
        // storage: 序列化数据（首次创建时为 null）
        // scene: 场景实例

        // 定义默认参数
        const params = {
            color: '#00ffff',
            size: 10
        };

        // 从 storage 恢复参数
        if (storage?.params) {
            Object.assign(params, storage.params);
        }

        // 创建 Three.js 对象
        const mesh = new THREE.Mesh(geometry, material);
        mesh.params = params;  // 保存参数引用

        return mesh;
    },

    // 可选：创建参数面板
    createPanel(instance, folder) {
        const params = instance.params;
        folder.add(params, 'size', 1, 20).name('大小').onChange(() => {
            // 更新逻辑
        });
        folder.addColorRGB(params, 'color').name('颜色').onChange(() => {
            // 更新逻辑
        });
    },

    // 可选：序列化（保存场景时调用）
    getStorage(instance) {
        return { params: { ...instance.params } };
    },

    // 可选：反序列化（加载场景时调用）
    setStorage(instance, storage) {
        if (!storage?.params) return;
        Object.assign(instance.params, storage.params);
        // 更新实例状态
    }
}
```

## 关键要点

1. **参数管理**：在 create 方法内定义默认参数，通过 storage 恢复
2. **动画更新**：使用 `scene.addUpdateListener(() => {})` 添加动画循环
3. **内置面板**：实现 `createPanel` 方法支持参数调整
4. **参数保存**：实现 `getStorage` 和 `setStorage` 方法
5. **导入路径**：使用 `import * as THREE from 'three'`

## 代码简化原则

1. **避免冗余**：不添加 initParam、initFolder 等非必要的初始化方法
2. **精简变量**：使用简短变量名（如 `p` 代替 `params`）
3. **箭头函数**：getStorage/setStorage 使用箭头函数简化
4. **直接赋值**：避免不必要的中间变量和函数封装

## 示例

用户输入：创建一个旋转的立方体

输出：
```javascript
import * as THREE from 'three';

export default {
    name: '旋转立方体',
    label: '旋转立方体',

    create(storage, { scene }) {
        const params = {
            size: 2,
            color: '#00ffff',
            speed: 1
        };

        if (storage?.params) {
            Object.assign(params, storage.params);
        }

        const geometry = new THREE.BoxGeometry(params.size, params.size, params.size);
        const material = new THREE.MeshStandardMaterial({ color: params.color });
        const cube = new THREE.Mesh(geometry, material);
        cube.params = params;

        scene.addUpdateListener(() => {
            cube.rotation.y += 0.01 * params.speed;
        });

        return cube;
    },

    createPanel(cube, folder) {
        const params = cube.params;
        folder.add(params, 'size', 1, 10).name('大小').onChange(() => {
            cube.geometry.dispose();
            cube.geometry = new THREE.BoxGeometry(params.size, params.size, params.size);
        });
        folder.addColorRGB(params, 'color').name('颜色').onChange(() => {
            cube.material.color.set(params.color);
        });
        folder.add(params, 'speed', 0, 5).name('速度');
    },

    getStorage(cube) {
        return { params: { ...cube.params } };
    },

    setStorage(cube, storage) {
        if (!storage?.params) return;
        Object.assign(cube.params, storage.params);
        cube.material.color.set(cube.params.color);
    }
};
```
