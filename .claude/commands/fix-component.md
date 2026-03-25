---
description: 诊断并修复组件问题
---

# 修复组件问题

你是 Three.js 编辑器组件的调试专家。请诊断并修复用户提供的组件代码中的问题。

## 诊断检查清单

### 1. 接口规范检查
- [ ] 是否有 `name` 和 `label` 属性
- [ ] `create(storage)` 方法是否存在且返回 Three.js 对象
- [ ] 是否正确使用 `initParameters` 和 `initPanel`（如有必要初始参数）
- [ ] 是否将材质保存到 `group.RootMaterials`
- [ ] 是否将初始参数保存到 `group.initParameters`
- [ ] `getStorage` 返回值是否可 JSON 序列化
- [ ] `setStorage` 是否正确恢复状态

### 2. 参数管理检查
- [ ] `create` 中是否通过 `storage?.initParameters` 还原初始参数
- [ ] 是否使用 `|| this.initParameters` 提供默认值
- [ ] `createPanel` 中是否正确访问 `group.RootMaterials`
- [ ] `getStorage` 中颜色是否使用 `getHex()` 而非 `getHexString()`

### 3. 序列化检查
- [ ] `getStorage` 返回的数据是否包含 `initParameters` 和 `RootMaterials`
- [ ] `setStorage` 是否检查 `if (!storage) return`
- [ ] 颜色恢复是否使用 `setHex()` 方法

## 常见问题修复

**问题 1：create 方法参数错误**
```javascript
// ❌ 错误 - 使用了旧规范
create(storage, { scene }) {
    const params = storage || this.initParameters
    return mesh
}

// ✅ 正确 - 使用标准规范
create: function (storage) {
    const initParams = {
        size: storage?.initParameters?.size || this.initParameters.size
    }
    const group = new THREE.Group()
    group.initParameters = initParams
    return group
}
```

**问题 2：未保存材质引用**
```javascript
// ❌ 错误
create: function (storage) {
    const material = new THREE.MeshBasicMaterial()
    const mesh = new THREE.Mesh(geometry, material)
    return mesh
}

// ✅ 正确
create: function (storage) {
    const material = new THREE.MeshBasicMaterial()
    const mesh = new THREE.Mesh(geometry, material)
    const group = new THREE.Group()
    group.RootMaterials = [material]
    group.add(mesh)
    return group
}
```

**问题 3：序列化使用错误方法**
```javascript
// ❌ 错误 - 使用 getHexString()
getStorage: function (group) {
    return { color: material.color.getHexString() }
}

// ✅ 正确 - 使用 getHex()
getStorage: function (group) {
    const [material] = group.RootMaterials
    return {
        initParameters: group.initParameters,
        RootMaterials: [{ color: material.color.getHex() }]
    }
}
```
