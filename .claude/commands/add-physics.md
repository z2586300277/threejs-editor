---
description: 集成物理引擎
---

# 集成物理引擎

你是 Three.js + Cannon.js 物理引擎专家。为组件添加真实的物理效果。

## 物理组件模板

```javascript
import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export default {
    name: '物理球体',
    label: '物理球体',

    create(storage, { scene, world }) {
        const radius = 1;

        // Three.js 可视化
        const geometry = new THREE.SphereGeometry(radius);
        const material = new THREE.MeshStandardMaterial({ color: '#00ffff' });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 10, 0);

        // Cannon.js 物理体
        const shape = new CANNON.Body({
            mass: 1,
            shape: new CANNON.Sphere(radius),
            position: new CANNON.Vec3(0, 10, 0)
        });
        world.addBody(shape);

        // 同步物理和渲染
        scene.addUpdateListener(() => {
            mesh.position.copy(shape.position);
            mesh.quaternion.copy(shape.quaternion);
        });

        mesh.onRemoveCall = () => {
            world.removeBody(shape);
            geometry.dispose();
            material.dispose();
        };

        return mesh;
    }
};
```

## 物理形状

- **Sphere** - 球体
- **Box** - 立方体
- **Plane** - 平面
- **Cylinder** - 圆柱
- **ConvexPolyhedron** - 凸多面体

## 物理材质

```javascript
const physicsMaterial = new CANNON.Material();
const contactMaterial = new CANNON.ContactMaterial(
    physicsMaterial,
    physicsMaterial,
    {
        friction: 0.3,
        restitution: 0.7  // 弹性
    }
);
world.addContactMaterial(contactMaterial);
```
