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
import { getObjectViews, createGsapAnimation } from './lib'

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
    list: [
      'editorJson/draw.json',
      'editorJson/animous.json',
    ].map(v => __isProduction__ ? '/threejs-editor/' + v : '/' + v)
  },
  {
    icon: 'office-building',
    title: '模型',
    list: [
      'https://z2586300277.github.io/three-editor/dist/files/resource/datacenter.glb',
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
    ]
  },
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
      controls.target.copy(target)
      transformControls.attach(model)
    })
  }
}

function clickLeft(v) {
  if(active.value === '配置案例')  loadScene(v)
  else if(active.value === '模型') loadModel(v)
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
