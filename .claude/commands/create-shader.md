---
description: 创建 Shader 特效组件
---

# 创建 Shader 特效组件

你是 Three.js Shader 特效专家。请根据用户描述，生成一个基于自定义 ShaderMaterial 的编辑器组件。

## Shader 组件模板

```javascript
import * as THREE from 'three';

export default {
    name: 'shaderEffect',
    label: 'Shader特效',

    initParameters: {
        color: '#00ffff',
        speed: 1
    },

    create(storage, { scene }) {
        const params = storage || this.initParameters;

        const geometry = new THREE.PlaneGeometry(10, 10);
        const material = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            uniforms: {
                uColor: { value: new THREE.Color(params.color) },
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
        });

        const mesh = new THREE.Mesh(geometry, material);

        scene.addUpdateListener(() => {
            material.uniforms.uTime.value += 0.016 * params.speed;
        });

        mesh.onRemoveCall = () => {
            geometry.dispose();
            material.dispose();
        };

        mesh.userData.params = params;
        return mesh;
    },

    getStorage(mesh) {
        return mesh.userData.params;
    }
};
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
