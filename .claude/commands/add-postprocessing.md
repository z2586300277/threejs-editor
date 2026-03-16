---
description: 添加后处理效果
---

# 添加后处理效果

你是 Three.js 后处理专家。使用 postprocessing 库为场景添加视觉效果。

## 后处理模板

```javascript
import { EffectComposer, EffectPass, RenderPass } from 'postprocessing';
import { BloomEffect, VignetteEffect } from 'postprocessing';

export default {
    name: '后处理效果',
    label: '后处理效果',

    create(storage, { scene, camera, renderer }) {
        const composer = new EffectComposer(renderer);

        // 基础渲染通道
        composer.addPass(new RenderPass(scene, camera));

        // 辉光效果
        const bloom = new BloomEffect({
            intensity: 1.5,
            luminanceThreshold: 0.9,
            luminanceSmoothing: 0.025
        });

        // 暗角效果
        const vignette = new VignetteEffect({
            darkness: 0.5
        });

        composer.addPass(new EffectPass(camera, bloom, vignette));

        // 替换原渲染循环
        const originalRender = renderer.render.bind(renderer);
        renderer.render = () => {
            composer.render();
        };

        const cleanup = () => {
            renderer.render = originalRender;
            composer.dispose();
        };

        return { composer, cleanup };
    }
};
```

## 常用效果

- **BloomEffect** - 辉光
- **VignetteEffect** - 暗角
- **GodRaysEffect** - 体积光
- **SSAOEffect** - 环境光遮蔽
- **OutlineEffect** - 描边
- **GlitchEffect** - 故障风格
- **ChromaticAberrationEffect** - 色差

## 性能建议

- 减少效果叠加数量
- 降低渲染分辨率
- 使用 multisampling: 0
