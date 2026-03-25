---
description: 创建 Three.js 编辑器组件
---

# 创建 Three.js 组件

你是 Three.js 编辑器的组件开发专家。请根据用户描述，在 `src/editor/compoents/` 目录下生成一个新的 3D 组件文件。

## 标准组件规范

参考 `src/editor/compoents/光柱.js` 的标准实现，所有组件必须遵循以下接口：

```javascript
export default {
    name: 'componentName',
    label: '组件名称',

    // 只针对必要初始传参（可选）
    initParameters: {
        url: 'https://example.com/texture.png',
        size: 0.25
    },

    // 只针对必要初始传参面板（可选）
    initPanel: function (folder) {
        folder.add(this.initParameters, 'url').name('资源路径')
        folder.add(this.initParameters, 'size').name('尺寸')
    },

    // 创建组件（没有初始必要参数的话一般不使用storage）
    create: function (storage) {
        // 获取初始参数 只针对初始参数还原
        const initParams = {
            size: storage?.initParameters?.size || this.initParameters.size,
            url: storage?.initParameters?.url || this.initParameters.url
        }

        // 创建几何体和材质
        const geometry = new THREE.BoxGeometry(initParams.size, initParams.size, initParams.size)
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 })
        const mesh = new THREE.Mesh(geometry, material)

        // 创建group
        const group = new THREE.Group()
        group.RootMaterials = [material]  // 保存材质引用用于面板控制
        group.add(mesh)
        group.initParameters = initParams  // 保存初始参数

        return group
    },

    // 创建控制面板
    createPanel(group, folder) {
        const [material] = group.RootMaterials

        folder.add(group.initParameters, 'url').name('资源路径')
        folder.addHexColor(material.color).name('颜色')
        folder.add(material, 'opacity', 0, 1).name('透明度')
    },

    // 获取存储数据
    getStorage: function (group) {
        const { initParameters } = group
        const [material] = group.RootMaterials

        return {
            initParameters,
            RootMaterials: [
                { color: material.color.getHex(), opacity: material.opacity }
            ]
        }
    },

    // 设置存储数据
    setStorage: function (group, storage) {
        if (!storage) return

        const [material] = group.RootMaterials
        const [materialStorage] = storage.RootMaterials

        material.color.setHex(materialStorage.color)
        material.opacity = materialStorage.opacity
    }
}
```

## 关键要点

1. **initParameters**：只针对必要的初始传参（如资源路径、初始尺寸），没有则不需要
2. **initPanel**：配置初始参数面板，与 initParameters 配套使用
3. **create**：只接收 storage 参数，通过 `storage?.initParameters` 还原初始参数
4. **RootMaterials**：保存材质引用到 group 上，用于 createPanel 控制和序列化
5. **initParameters**：保存到 group 上，用于面板显示和序列化
6. **getStorage/setStorage**：序列化和反序列化，只保存必要数据（颜色用 getHex()）

## 示例

用户输入：创建一个旋转的立方体

输出：
```javascript
import * as THREE from 'three'

export default {
    name: 'rotatingCube',
    label: '旋转立方体',

    initParameters: {
        size: 2,
        speed: 1
    },

    initPanel: function (folder) {
        folder.add(this.initParameters, 'size', 0.5, 5).name('尺寸')
        folder.add(this.initParameters, 'speed', 0, 5).name('速度')
    },

    create: function (storage) {
        const initParams = {
            size: storage?.initParameters?.size || this.initParameters.size,
            speed: storage?.initParameters?.speed || this.initParameters.speed
        }

        const geometry = new THREE.BoxGeometry(initParams.size, initParams.size, initParams.size)
        const material = new THREE.MeshStandardMaterial({ color: 0x00ffff, transparent: true, opacity: 0.8 })
        const mesh = new THREE.Mesh(geometry, material)

        const group = new THREE.Group()
        group.RootMaterials = [material]
        group.add(mesh)
        group.initParameters = initParams

        // 添加动画（如果需要访问 scene，通过 this.scene 或传入）
        const animate = () => {
            mesh.rotation.y += 0.01 * initParams.speed
        }
        group.userData.animate = animate

        return group
    },

    createPanel(group, folder) {
        const [material] = group.RootMaterials

        folder.add(group.initParameters, 'size', 0.5, 5).name('尺寸').onChange(() => {
            const mesh = group.children[0]
            mesh.geometry.dispose()
            mesh.geometry = new THREE.BoxGeometry(
                group.initParameters.size,
                group.initParameters.size,
                group.initParameters.size
            )
        })

        folder.add(group.initParameters, 'speed', 0, 5).name('速度')
        folder.addHexColor(material.color).name('颜色')
        folder.add(material, 'opacity', 0, 1).name('透明度')
    },

    getStorage: function (group) {
        const { initParameters } = group
        const [material] = group.RootMaterials

        return {
            initParameters,
            RootMaterials: [
                { color: material.color.getHex(), opacity: material.opacity }
            ]
        }
    },

    setStorage: function (group, storage) {
        if (!storage) return

        const [material] = group.RootMaterials
        const [materialStorage] = storage.RootMaterials

        material.color.setHex(materialStorage.color)
        material.opacity = materialStorage.opacity
    }
}
```
