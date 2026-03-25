---
description: 创建 Shader 特效组件
---

# 创建 Shader 特效组件

你是 Three.js Shader 特效专家。请根据用户描述，生成一个基于自定义 ShaderMaterial 的编辑器组件。

## Shader 组件模板

```javascript
import * as THREE from 'three'

export default {
    name: 'shaderEffect',
    label: 'Shader特效',

    initParameters: {
        size: 10,
        speed: 1
    },

    initPanel: function (folder) {
        folder.add(this.initParameters, 'size', 1, 20).name('尺寸')
        folder.add(this.initParameters, 'speed', 0, 5).name('速度')
    },

    create: function (storage) {
        const initParams = {
            size: storage?.initParameters?.size || this.initParameters.size,
            speed: storage?.initParameters?.speed || this.initParameters.speed
        }

        const geometry = new THREE.PlaneGeometry(initParams.size, initParams.size)
        const material = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            uniforms: {
                uColor: { value: new THREE.Color(0x00ffff) },
                uTime: { value: 0 }
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                uniform float uTime;
                varying vec2 vUv;

                void main() {
                    float alpha = sin(vUv.x * 10.0 + uTime) * 0.5 + 0.5;
                    gl_FragColor = vec4(uColor, alpha);
                }
            `
        })

        const mesh = new THREE.Mesh(geometry, material)

        const group = new THREE.Group()
        group.RootMaterials = [material]
        group.add(mesh)
        group.initParameters = initParams

        return group
    },

    createPanel(group, folder) {
        const [material] = group.RootMaterials

        folder.add(group.initParameters, 'speed', 0, 5).name('速度')
        folder.addHexColor(material.uniforms.uColor.value).name('颜色')
    },

    getStorage: function (group) {
        const { initParameters } = group
        const [material] = group.RootMaterials

        return {
            initParameters,
            RootMaterials: [
                { color: material.uniforms.uColor.value.getHex() }
            ]
        }
    },

    setStorage: function (group, storage) {
        if (!storage) return

        const [material] = group.RootMaterials
        const [materialStorage] = storage.RootMaterials

        material.uniforms.uColor.value.setHex(materialStorage.color)
    }
}
```

## Shader 开发要点

1. **Uniform 更新**：在 `addUpdateListener` 中更新 `uTime` 等 uniform
2. **精度声明**：移动端需要 `precision mediump float;`
3. **Varying 一致**：vertex 和 fragment shader 中的 varying 必须匹配
4. **性能优化**：避免在 shader 中使用复杂循环

## 常用 Shader 效果

- 波纹扩散：`sin(distance(vUv, vec2(0.5)) * 10.0 - uTime)`
- 渐变消失：`(1.0 - vUv.y) * opacity`
- 菲涅尔效果：`pow(1.0 - dot(viewDir, normal), 2.0)`
- 噪声扰动：使用 simplex noise 函数
