<template>
  <div class="left">
    <div class="nav-menu">
      <div class="menu-item" v-for="(item, index) in data" :key="index" @click="setActive(index)">
        <el-button :class="{ 'active-icon': active == index, 'normal-icon': active != index }" link :icon="item.icon"
          :title="item.title" />
        <span :class="{ 'active-text': active == index }">{{ item.title }}</span>
      </div>
    </div>

    <div class="content-panel">
      <div class="build">
        <div class="back" v-for="i in showList">
          <div class="item">
            <el-link @click="clickLeft(i)">
              {{ getName(i) }}
            </el-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { getObjectViews, createGsapAnimation } from './lib'

const data = [
  { icon: 'set-up', title: '配置案例' },
  { icon: 'office-building', title: '模型' },
];
const active = ref(localStorage.getItem('active') || 0);
function setActive(index) {
  localStorage.setItem('active', index);
  active.value = index;
  changePanel()
}
const getName = (url) => url.split('/').pop()

const loadingDiv = document.createElement('div')
loadingDiv.innerText = '加载中...'
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
const load = (url) => {
  const { modelCores } = window.threeEditor
  const { camera, controls, transformControls } = threeEditor
  const { loaderService } = modelCores.loadModel(url)

  document.body.appendChild(loadingDiv)
  loaderService.progress = progress => {
    loadingDiv.innerText = '下载' + (progress * 100).toFixed(2) + '%'
  }

  loaderService.complete = model => {
    document.body.removeChild(loadingDiv)
    const { maxView, target } = getObjectViews(model)
    Promise.all([createGsapAnimation(camera.position, maxView), createGsapAnimation(controls.target, target)]).then(() => {
      controls.target.copy(target)
      transformControls.attach(model)
    })
  }
}

let editorList = [
  'editorJson/draw.json',
  'editorJson/animous.json',
].map(v => __isProduction__ ? '/threejs-editor/' + v : '/' + v)
let modelList = [
  'https://z2586300277.github.io/3d-file-server/models/glb/computer.glb',
  'https://z2586300277.github.io/3d-file-server/models/glb/daodan.glb',
  'https://z2586300277.github.io/3d-file-server/models/glb/feiji.glb',
  'https://z2586300277.github.io/3d-file-server/models/glb/gongren.glb',
  'https://z2586300277.github.io/3d-file-server/models/glb/leida.glb',
  'https://z2586300277.github.io/3d-file-server/models/glb/plane.glb',
  'https://z2586300277.github.io/3d-file-server/models/glb/robot.glb',
  'https://z2586300277.github.io/3d-file-server/models/glb/wajueji.glb',
  'https://z2586300277.github.io/three-editor/dist/files/resource/LittlestTokyo.glb',
  'https://z2586300277.github.io/three-editor/dist/files/resource/Soldier.glb',
  'https://z2586300277.github.io/three-editor/dist/files/resource/aroundBuilding.FBX',
  'https://z2586300277.github.io/three-editor/dist/files/resource/foorGround.glb',
  'https://z2586300277.github.io/three-editor/dist/files/resource/car.glb',
  'https://z2586300277.github.io/three-editor/dist/files/resource/tree.glb',
  'https://z2586300277.github.io/three-editor/dist/files/resource/bird.glb',
  'https://z2586300277.github.io/three-editor/dist/files/resource/bird2.glb',
  'https://z2586300277.github.io/three-editor/dist/files/resource/bird3.glb',
  'https://z2586300277.github.io/three-editor/dist/files/resource/Fox.glb',
  'https://z2586300277.github.io/three-editor/dist/files/resource/shanghai.FBX',
  'https://z2586300277.github.io/three-editor/dist/files/resource/datacenter.glb'
]

const showList = ref(editorList)
const clickLeft = (v) => {
  if (active.value == 1) load(v)
  else if (active.value == 0) {
    fetch(v).then(res => res.json()).then(res => {
      threeEditor?.resetEditorStorage(res)
    })
  }

}

changePanel()
function changePanel() {
  if (active.value == 0) {
    showList.value = editorList
  } else if (active.value == 1) {
    showList.value = modelList
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
    padding: 4px;
    box-sizing: border-box;
  }

}
</style>
