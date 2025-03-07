<template>
  <div class="layout">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="header-box">
        <div class="header-left">
          <el-select v-model="sceneName" placeholder="选择场景" style="width: 200px">
            <el-option label="默认场景" value="default" />
          </el-select>
          <el-button class="btn-add" link>新建场景</el-button>
        </div>
        <div class="title">Three.js Editor</div>
        <div class="header-right">
          <el-button link>导出</el-button>
          <el-button>保存</el-button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 左侧面板 -->
      <div class="side-panel left-panel">
        <div class="panel-header">场景层级</div>
        <div class="panel-content">
          <el-tree :data="treeData" :props="defaultProps" />
        </div>
      </div>

      <!-- 中间编辑区域 -->
      <div class="center-panel">
        <!-- 顶部工具栏 -->
        <div class="toolbar">
          <el-radio-group v-model="editMode">
            <el-radio-button label="select">选择</el-radio-button>
            <el-radio-button label="translate">平移</el-radio-button>
            <el-radio-button label="rotate">旋转</el-radio-button>
            <el-radio-button label="scale">缩放</el-radio-button>
          </el-radio-group>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="side-panel right-panel">
        <div class="panel-header">属性</div>
        <div class="panel-content">
          <el-form label-width="60px">
            <el-form-item label="位置">
              <div class="input-group">
                <el-input-number v-model="position.x" size="small" :controls="false" placeholder="X"/>
                <el-input-number v-model="position.y" size="small" :controls="false" placeholder="Y"/>
                <el-input-number v-model="position.z" size="small" :controls="false" placeholder="Z"/>
              </div>
            </el-form-item>
            <el-form-item label="旋转">
              <div class="input-group">
                <el-input-number v-model="rotation.x" size="small" :controls="false" placeholder="X"/>
                <el-input-number v-model="rotation.y" size="small" :controls="false" placeholder="Y"/>
                <el-input-number v-model="rotation.z" size="small" :controls="false" placeholder="Z"/>
              </div>
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const sceneName = ref('default')
const editMode = ref('select')
const activeTab = ref('properties')
const showGrid = ref(true)

const position = reactive({ x: 0, y: 0, z: 0 })
const rotation = reactive({ x: 0, y: 0, z: 0 })
const scale = reactive({ x: 1, y: 1, z: 1 })

const treeData = [
  {
    label: '场景',
    children: [
      { label: '相机' },
      { label: '网格' },
      { label: '光源' }
    ]
  }
]

const defaultProps = {
  children: 'children',
  label: 'label'
}
</script>

<style lang="less" scoped>
.layout {
  height: 100vh;
  width: 100vw;
  background-color: #1f1f1f;
  color: #E5EAF3;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #181818;
  height: 50px;
  border-bottom: 1px solid #404040;
  
  &-box {
    height: 100%;
    padding: 0 20px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
  }
  
  .title {
    text-align: center;
    font-size: 18px;
  }

  &-right {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }
}

.main-content {
  flex: 1;
  display: flex;
  position: relative;
}

.side-panel {
  width: 280px;
  background-color: #252525;
  display: flex;
  flex-direction: column;
  
  .panel-header {
    padding: 12px 16px;
    font-size: 14px;
    font-weight: 500;
    border-bottom: 1px solid #404040;
    background-color: #1e1e1e;
  }
  
  .panel-content {
    flex: 1;
    padding: 12px;
    overflow-y: auto;
  }
}

.left-panel {
  border-right: 1px solid #404040;
}

.right-panel {
  border-left: 1px solid #404040;
}

.center-panel {
  flex: 1;
  background-color: #1e1e1e;
  position: relative;
}

.toolbar {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #252525;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #404040;
}

.input-group {
  display: flex;
  gap: 8px;

  :deep(.el-input-number) {
    flex: 1;
    width: 0;
  }
}

:deep(.el-tree) {
  background: none;
  color: #E5EAF3;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

.btn-add {
  margin-left: 20px;
  color: #E5EAF3;
}
</style>