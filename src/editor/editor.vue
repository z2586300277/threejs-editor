<template>
    <div class="edit" ref="editor"> </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { ThreeEditor } from '../../../Vite_three-editor/lib/main'
import tamplateJson from './template.json'
// import { ThreeEditor } from '../../../Vite_three-editor/dist/index'
// import { ThreeEditor } from 'three-edit-cores'

// ThreeEditor.dracoPath = '/draco/' 

const editor = ref(null)

const { dataCores } = defineProps(['dataCores'])
watch(() => dataCores.sceneName, (val) => {
    let params = localStorage.getItem(dataCores.sceneName)
    params = JSON.parse(params)
    threeEditor?.resetEditorStorage(params||tamplateJson)
})

window.threeEditor = null

function init() {

    threeEditor = new ThreeEditor(editor.value, {

        fps: null,

        pixelRatio: window.devicePixelRatio * 1,

        webglRenderParams: { antialias: true, alpha: true, logarithmicDepthBuffer: true },

        sceneParams: JSON.parse(localStorage.getItem(dataCores.sceneName))

    })

    threeEditor.openControlPanel()

    window.addEventListener('resize', () => {

        threeEditor.renderSceneResize()

    })

}

onMounted(() => {

    init();

})

onUnmounted(() => {

    threeEditor?.destroySceneRender()

});

</script>

<style scoped>
.edit {
    width: 100vw;
    height: 100vh;
}
</style>