<template>
  <div class="layout">
    <!-- 顶部导航栏 -->
    <div class="header">
      <div class="header-box">
        <div class="header-left">
          <el-select v-model="sceneName" placeholder="场景" size="large" style="width: 200px">
            <el-option label="测试场景" value="测试场景" />
            <el-option label="默认场景" value="默认场景" />
          </el-select>
          <el-button class="btn-add" link>新建场景</el-button>
        </div>
        <div class="title">Three.js Editor</div>
        <div class="header-right">
          <el-button @click="saveScene">保存</el-button>
        </div>
      </div>
    </div>

    <!-- 主体内容区域 -->
    <div class="main-container">
      <!-- 左侧面板 - 可收缩 -->
      <div class="side-panel left-panel" :class="{ 'collapsed': leftCollapsed }">
        <div class="panel-toggle" @click="leftCollapsed = !leftCollapsed">
          <el-icon>
            <component :is="leftCollapsed ? 'ArrowRight' : 'ArrowLeft'" />
          </el-icon>
        </div>
      </div>

      <!-- 中间区域 -->
      <div class="center-panel">
        <!-- 顶部工具栏 -->
        <div class="top-toolbar">
          <!-- <el-radio-group v-model="currentMode" size="small">
            <el-radio-button label="选中" />
            <el-radio-button label="平移" />
            <el-radio-button label="旋转" />
            <el-radio-button label="缩放" />
          </el-radio-group> -->
        </div>
      </div>

      <!-- 右侧面板 - 可收缩 -->
      <div class="side-panel right-panel" :class="{ 'collapsed': rightCollapsed }">
        <div class="panel-toggle" @click="rightCollapsed = !rightCollapsed">
          <el-icon>
            <component :is="rightCollapsed ? 'ArrowLeft' : 'ArrowRight'" />
          </el-icon>
        </div>
      </div>
    </div>
  </div>

  <Editor class="editor" />
</template>

<script setup>
import { ref } from 'vue'
import Editor from './editor.vue'
import { ElButton, ElSelect, ElOption, ElMessage } from 'element-plus'

// 基础数据
const sceneName = ref('测试场景')
const currentMode = ref('选中')

// 面板状态
const leftCollapsed = ref(false)
const rightCollapsed = ref(false);

function saveScene() {

  localStorage.setItem('sceneStorage', JSON.stringify(threeEditor.saveSceneEdit()))

  ElMessage.success('保存成功')

}
</script>

<style lang="less" scoped>
.editor {
  position: absolute;
  top: 0;
}

.layout {
  background-color: #1f1f1f;
  height: 100vh;
  width: 100vw;
  color: #E5EAF3;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background-color: #181818;
  height: 50px;
  border-bottom: 1px solid #404040;
  z-index: 10;

  &-box {
    height: 100%;
    padding: 0 20px;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
  }

  &-left {
    display: flex;
    align-items: center;
  }

  .title {
    color: #E5EAF3;
    font-size: 18px;
    text-align: center;
  }

  &-right {
    display: flex;
    justify-content: flex-end;
  }
}

.main-container {
  flex: 1;
  display: flex;
  position: relative;
}

.side-panel {
  position: absolute;
  height: 100%;
  background-color: #252525;
  transition: all 0.3s ease;
  z-index: 5;

  .panel-toggle {
    width: 16px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #333;
    cursor: pointer;
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 3px;
    z-index: 2;

    &:hover {
      background-color: #444;
    }
  }
}

.left-panel {
  left: 0;
  width: 280px;
  border-right: 1px solid #404040;

  .panel-toggle {
    right: -16px;
  }

  &.collapsed {
    width: 0;
  }
}

.right-panel {
  right: 0;
  width: 280px;
  border-left: 1px solid #404040;

  .panel-toggle {
    left: -16px;
  }

  &.collapsed {
    width: 0;
  }
}

.center-panel {
  flex: 1;
  background-color: #1e1e1e;
  position: relative;
  width: 100%;
}

.top-toolbar {
  position: absolute;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  background-color: #252525;
  padding: 6px;
  border-radius: 4px;
  border: 1px solid #404040;
}

.btn-add {
  margin-left: 15px;
  color: #E5EAF3;
}
</style>