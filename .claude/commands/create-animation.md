---
description: 创建 GSAP 动画效果
---

# 创建动画效果

你是 Three.js + GSAP 动画专家。请根据用户描述，为组件或场景创建流畅的动画效果。

## GSAP 动画模板

```javascript
import gsap from 'gsap';

// 基础动画
function createBasicAnimation(target, duration = 2) {
    gsap.to(target.position, {
        x: 10,
        y: 5,
        z: 0,
        duration: duration,
        ease: "power2.inOut"
    });
}

// 循环动画
function createLoopAnimation(target) {
    gsap.to(target.rotation, {
        y: Math.PI * 2,
        duration: 3,
        repeat: -1,
        ease: "none"
    });
}

// 序列动画
function createSequenceAnimation(targets) {
    const tl = gsap.timeline();
    targets.forEach((target, i) => {
        tl.to(target.position, {
            y: 5,
            duration: 0.5,
            ease: "bounce.out"
        }, i * 0.2);
    });
    return tl;
}

// 相机动画（编辑器常用）
function createCameraAnimation(camera, controls, targetPos, targetLookAt) {
    return Promise.all([
        gsap.to(camera.position, {
            x: targetPos.x,
            y: targetPos.y,
            z: targetPos.z,
            duration: 2,
            ease: "power2.inOut"
        }),
        gsap.to(controls.target, {
            x: targetLookAt.x,
            y: targetLookAt.y,
            z: targetLookAt.z,
            duration: 2,
            ease: "power2.inOut"
        })
    ]);
}
```

## 常用缓动函数

- `power1/2/3/4.in/out/inOut` - 加速/减速
- `back.in/out/inOut` - 回弹效果
- `elastic.in/out/inOut` - 弹性效果
- `bounce.in/out/inOut` - 弹跳效果
- `none` - 线性，无缓动

## 动画组件示例

```javascript
export default {
    name: '动画立方体',
    label: '动画立方体',

    create(storage, { scene }) {
        const geometry = new THREE.BoxGeometry(2, 2, 2);
        const material = new THREE.MeshStandardMaterial({ color: '#00ffff' });
        const cube = new THREE.Mesh(geometry, material);

        // 入场动画
        cube.scale.set(0, 0, 0);
        gsap.to(cube.scale, {
            x: 1, y: 1, z: 1,
            duration: 1,
            ease: "back.out(1.7)"
        });

        // 循环旋转
        gsap.to(cube.rotation, {
            y: Math.PI * 2,
            duration: 4,
            repeat: -1,
            ease: "none"
        });

        cube.onRemoveCall = () => {
            gsap.killTweensOf(cube.position);
            gsap.killTweensOf(cube.rotation);
            gsap.killTweensOf(cube.scale);
            geometry.dispose();
            material.dispose();
        };

        return cube;
    }
};
```

## 关键要点

1. **清理动画**：在 `onRemoveCall` 中使用 `gsap.killTweensOf()`
2. **性能优化**：避免同时运行过多动画
3. **时间线控制**：使用 `gsap.timeline()` 管理复杂序列
