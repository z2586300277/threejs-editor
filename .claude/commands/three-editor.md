---
description: Three.js Editor Claude Skills
---

# Three.js Editor Claude Skills

Three.js 编辑器的 Claude Code 自定义技能集，用于辅助开发。

## 📦 已安装的 Skills

### 组件开发
- `/create-component` - 创建标准 3D 组件
- `/create-shader` - 创建自定义 Shader 特效
- `/create-chart` - 创建 ECharts 数据可视化
- `/create-animation` - 创建 GSAP 动画效果

### 场景管理
- `/create-template` - 创建完整场景配置模板

### 代码质量
- `/fix-component` - 诊断并修复组件问题
- `/review-component` - 代码审查和改进建议
- `/optimize-performance` - 性能优化分析

### 高级功能
- `/add-physics` - 集成 Cannon.js 物理引擎
- `/add-postprocessing` - 添加后处理视觉效果

## 🚀 使用示例

```bash
# 创建一个旋转的立方体组件
/create-component 创建一个旋转的立方体

# 创建波纹扩散 shader 效果
/create-shader 创建一个波纹扩散效果

# 创建实时折线图
/create-chart 创建一个实时更新的折线图

# 修复组件内存泄漏
/fix-component 修复内存泄漏问题

# 审查粒子系统性能
/review-component 审查这个粒子系统组件
```

## 📚 组件开发规范

所有组件必须遵循以下接口：

```javascript
export default {
  name: 'componentName',
  label: '组件名称',
  initParameters: { /* 默认参数 */ },
  create(storage, threeEditor) { /* 返回 Three.js 对象 */ },
  getStorage(mesh) { /* 序列化 */ },
  setStorage(mesh, storage) { /* 反序列化 */ }
}
```

## 🎯 关键要点

1. **资源清理**：必须设置 `mesh.onRemoveCall` 清理函数
2. **动画循环**：使用 `scene.addUpdateListener(() => {})`
3. **参数存储**：将配置存入 `mesh.userData.params`
4. **序列化**：`getStorage` 只返回可 JSON 序列化的数据

## 🛠️ 技术栈

- **Three.js** - 3D 渲染引擎
- **ECharts** - 数据可视化
- **GSAP** - 动画库
- **Cannon.js** - 物理引擎
- **postprocessing** - 后处理效果

## 📖 更多信息

查看 [README.md](.claude/commands/README.md) 获取完整开发指南。

## License

MIT
