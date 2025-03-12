<template>
  <div class="left">
    <div class="nav-menu">
      <div class="menu-item" v-for="item in data" :key="item.title" @click="setActive(item)">
        <el-button :class="{ 'active-icon': active == item.title, 'normal-icon': active != item.title }" link
          :icon="item.icon" :title="item.title" />
        <span :class="{ 'active-text': active == item.title }">{{ item.title }}</span>
      </div>
    </div>

    <div class="content-panel">
      <div class="build">
        <div class="back" v-for="i in showList">
          <div class="item">
            <el-link @click="clickLeft(i)">
              {{ i.split('/').pop() }}
            </el-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ThreeEditor, getObjectViews, createGsapAnimation } from './lib'

// 导入外置组件
ThreeEditor.__DESIGNS__.push(...Object.values(import.meta.glob('./compoents/\*.js', { eager: true, import: 'default' }))) 

const editor_components = ThreeEditor.__DESIGNS__.map(v => v.label)

const loadingDiv = document.createElement('div')
Object.assign(loadingDiv.style, {
  pointerEvents: 'none',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%,-50%)',
  color: 'white',
  fontSize: '20px',
  backgroundColor: 'rgba(0,0,0,0.5)',
  padding: '10px 20px',
  borderRadius: '5px'
})

const data = [
  {
    icon: 'set-up',
    title: '配置案例',
    list: window.editorJsons.map(v => __isProduction__ ? '/threejs-editor/' + v : '/' + v)
  },
  {
    icon: 'office-building',
    title: '模型',
    list: window.models,
  },
  {
    title: '组件',
    icon: 'connection',
    list: editor_components
  }
];

const activeLocal = localStorage.getItem('active')
const showList = ref(data.find(v => v.title === activeLocal)?.list || data[0].list);
const active = ref(activeLocal || data[0].title);
function setActive(item) {
  localStorage.setItem('active', item.title);
  active.value = item.title;
  showList.value = item.list;
}

const loadScene = (v) => fetch(v).then(res => res.json()).then(res => threeEditor?.resetEditorStorage(res))
const loadModel = (url) => {
  const { modelCores } = window.threeEditor
  const { camera, controls, transformControls } = threeEditor
  const { loaderService } = modelCores.loadModel(url)
  document.body.appendChild(loadingDiv)
  loaderService.progress = progress => loadingDiv.innerText = '下载' + (progress * 100).toFixed(2) + '%'
  loaderService.complete = model => {
    document.body.removeChild(loadingDiv)
    const { maxView, target } = getObjectViews(model)
    Promise.all([createGsapAnimation(camera.position, maxView), createGsapAnimation(controls.target, target)]).then(() => {
      transformControls.attach(model)
    })
  }
}

async function clickLeft(v) {
  if (active.value === '配置案例') loadScene(v)
  else if (active.value === '模型') loadModel(v)
  else if (active.value === '组件') {
    const { scene, transformControls } = threeEditor
    const design = ThreeEditor.__DESIGNS__.find(d => d.label === v)
    const mesh = await design.create(null, threeEditor, threeEditor)
    if (!mesh) return
    mesh.isDesignMesh = true
    mesh.designType = design.name
    scene.add(mesh)
    const { maxView, target } = getObjectViews(mesh)
    createGsapAnimation(threeEditor.camera.position, maxView)
    createGsapAnimation(threeEditor.controls.target, target)
    transformControls.attach(mesh)
  }
}

</script>

<style lang="less" scoped>
.left {
  width: 280px;
  height: calc(100% - 50px);
  background-color: #181818;
  position: fixed;
  top: 50px;
  left: 0;
  z-index: 100;
  display: flex;
}

.nav-menu {
  width: 60px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #4a4a4a;
  box-sizing: border-box;
}

.menu-item {
  height: 62px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  cursor: pointer;
  border-bottom: 1px solid #3e3e3e;
  user-select: none;
  transition: all 0.2s ease;

  &:hover {
    background-color: #252525;
  }

  .normal-icon {
    font-size: 24px;
    transition: all 0.2s;
  }

  .active-icon {
    font-size: 28px;
    color: rgb(182, 211, 244);
    font-weight: 800;
    transition: all 0.2s;
  }

  .active-text {
    color: rgb(182, 211, 244);
    font-weight: bold;
  }
}

.content-panel {
  flex: 1;
  overflow: auto;
}

.build {
  padding: 4px;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: repeat(auto-fit, 80px);
  grid-template-columns: repeat(2, 1fr);
  overflow: scroll;
  height: 100%;
  justify-items: center;
  width: 100%;

  .back {
    height: 70px;
    width: 90px;
    border-radius: 6px;
    border: 1px solid #676768;
    display: flex;
    padding: 5px;
    box-sizing: border-box;
  }

  .item {
    border: 1px solid #3d3d3d;
    border-radius: 3px;
    height: 100%;
    width: 100%;
    word-wrap: break-word;
    word-break: break-all;
    font-size: 12px;
    display: flex;
    overflow-wrap: break-word;
    text-align: center;
    justify-content: center;
    align-content: center;
    justify-items: center;
    align-items: center;
    padding: 4px;  box-sizing: border-box;
  }

}
</style>
