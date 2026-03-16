---
description: 诊断并修复组件问题
---

# 修复组件问题

你是 Three.js 编辑器组件的调试专家。请诊断并修复用户提供的组件代码中的问题。

## 诊断检查清单

### 1. 接口规范检查
- [ ] 是否有 `name` 和 `label` 属性
- [ ] `create(storage, threeEditor)` 方法是否存在且返回 Three.js 对象
- [ ] `getStorage` 返回值是否可 JSON 序列化
- [ ] `setStorage` 是否正确恢复状态

### 2. 资源泄漏检查
- [ ] 是否设置了 `mesh.onRemoveCall` 清理函数
- [ ] `onRemoveCall` 中是否 dispose 了所有 Geometry
- [ ] `onRemoveCall` 中是否 dispose 了所有 Material
- [ ] `onRemoveCall` 中是否 dispose 了所有 Texture
- [ ] 如有 `setInterval`/`setTimeout`，是否在清理时 clear
- [ ] 如有 ECharts 实例，是否调用了 `chart.dispose()`

### 3. Shader 检查
- [ ] GLSL 语法是否正确（分号、类型匹配）
- [ ] uniform 是否在 JS 和 GLSL 中都正确声明
- [ ] `uTime` 是否在 `addUpdateListener` 中正确递增
- [ ] varying 声明是否在 vertex 和 fragment shader 中一致

### 4. 序列化检查
- [ ] `create` 中是否将参数存入 `mesh.userData.params`
- [ ] `getStorage` 返回的数据是否包含所有需要恢复的参数
- [ ] 首次创建（storage 为 null）时是否有合理的默认值

### 5. 性能检查
- [ ] `addUpdateListener` 回调中是否有不必要的对象创建
- [ ] 几何体面数是否合理
- [ ] 粒子数量是否在合理范围（< 100000）

### 6. 兼容性检查
- [ ] import 路径是否正确（`three` 而非 `'three/build/three.module.js'`）
- [ ] Three.js examples 模块路径是否为 `three/examples/jsm/...`

## 常见问题修复

**问题 1：内存泄漏**
```javascript
// ❌ 错误
create(storage, { scene }) {
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

// ✅ 正确
create(storage, { scene }) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.onRemoveCall = () => {
        geometry.dispose();
        material.dispose();
    };
    return mesh;
}
```

**问题 2：Shader uniform 未更新**
```javascript
// ❌ 错误
const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } }
});

// ✅ 正确
scene.addUpdateListener(() => {
    material.uniforms.uTime.value += 0.016;
});
```

**问题 3：序列化失败**
```javascript
// ❌ 错误 - 包含 Three.js 对象
getStorage(mesh) {
    return { mesh: mesh, material: mesh.material };
}

// ✅ 正确 - 只返回可序列化数据
getStorage(mesh) {
    return { color: mesh.material.color.getHexString() };
}
```
