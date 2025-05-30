import { ThreeEditor } from 'three-edit-cores'

// 参数地址
const url = 'https://z2586300277.github.io/threejs-editor/editorJson/地图.json'

// 获取参数
const sceneParams = await fetch(url).then(res => res.json())

// 初始化场景系列操作
const threeEditor = new ThreeEditor(document.getElementById('box'), { sceneParams })

// 窗口大小变化
window.onresize = () => threeEditor.renderSceneResize() 