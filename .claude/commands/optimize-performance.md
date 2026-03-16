---
description: 优化组件性能
---

# 性能优化

你是 Three.js 性能优化专家。请分析组件代码，提供性能优化建议和实现方案。

## 性能优化检查清单

### 1. 几何体优化
- [ ] 减少面数（使用 LOD）
- [ ] 合并几何体（BufferGeometryUtils.mergeGeometries）
- [ ] 使用 InstancedMesh 批量渲染
- [ ] 复用几何体

### 2. 材质优化
- [ ] 减少材质数量
- [ ] 使用简单材质（MeshBasicMaterial）
- [ ] 禁用不必要的特性（shadows, fog）
- [ ] 复用材质

### 3. 纹理优化
- [ ] 压缩纹理尺寸（2的幂次方）
- [ ] 使用纹理图集
- [ ] 设置合适的 minFilter/magFilter
- [ ] 及时 dispose 不用的纹理

### 4. 渲染优化
- [ ] 使用 Frustum Culling
- [ ] 减少 draw calls
- [ ] 避免透明物体重叠
- [ ] 使用 Object3D.visible 控制显示

### 5. 动画优化
- [ ] 避免在循环中创建对象
- [ ] 使用 requestAnimationFrame
- [ ] 减少 uniform 更新频率
- [ ] 使用 GPU 计算（shader）

## 优化示例

**优化前：**
```javascript
// ❌ 性能差 - 每帧创建新对象
scene.addUpdateListener(() => {
    const color = new THREE.Color(Math.random(), 0, 0);
    mesh.material.color = color;
});
```

**优化后：**
```javascript
// ✅ 性能好 - 复用对象
const tempColor = new THREE.Color();
scene.addUpdateListener(() => {
    tempColor.setRGB(Math.random(), 0, 0);
    mesh.material.color.copy(tempColor);
});
```

**批量渲染优化：**
```javascript
// ❌ 性能差 - 1000个独立mesh
for (let i = 0; i < 1000; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
}

// ✅ 性能好 - 使用 InstancedMesh
const instancedMesh = new THREE.InstancedMesh(geometry, material, 1000);
const matrix = new THREE.Matrix4();
for (let i = 0; i < 1000; i++) {
    matrix.setPosition(Math.random() * 100, 0, Math.random() * 100);
    instancedMesh.setMatrixAt(i, matrix);
}
scene.add(instancedMesh);
```

## 性能监控

```javascript
// 使用 Stats.js 监控性能
import Stats from 'three/examples/jsm/libs/stats.module.js';

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
    stats.begin();
    // 渲染代码
    stats.end();
}
```

## 性能目标

- FPS：≥ 60
- Draw Calls：< 100
- 三角形数：< 1,000,000
- 纹理内存：< 500MB
