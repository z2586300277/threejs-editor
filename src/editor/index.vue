<template>
  <div class="editor-container">
    <el-row class="mb-4">
      <el-button>默认按钮</el-button>
      <el-button type="primary">主要按钮</el-button>
      <el-button type="success">成功按钮</el-button>
    </el-row>
    
    <el-row class="mb-4">
      <el-input v-model="input" placeholder="请输入内容" style="width: 200px;" />
      
      <el-select v-model="value" placeholder="选择" style="margin-left: 10px;">
        <el-option
          v-for="item in options"
          :key="item.value"
          :label="item.label"
          :value="item.value"
        />
      </el-select>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const input = ref('')
const value = ref('')
const options = [
  { value: 'option1', label: '选项1' },
  { value: 'option2', label: '选项2' },
  { value: 'option3', label: '选项3' }
]
</script>

<style scoped>
.editor-container {
  padding: 20px;
}
.mb-4 {
  margin-bottom: 16px;
}
</style>