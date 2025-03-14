<template>
    <div class="edit" ref="editor"> </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import tamplateJson from './template.json'
import { ThreeEditor } from './lib'

ThreeEditor.dracoPath = __isProduction__ ? '/threejs-editor/draco/' : '/draco/'

let threeEditor = null
const editor = ref(null)
window.GUI_PARAMS = {
    step: 0.1,
}

const { dataCores } = defineProps(['dataCores'])
const emits = defineEmits(['emitThreeEditor'])

watch(() => dataCores.sceneName, (val) => {

    let params = localStorage.getItem(val + '-newEditor')
    params = JSON.parse(params) || tamplateJson
    
    try {
        threeEditor.resetEditorStorage(params)
    } catch (error) {
        localStorage.removeItem(val + '-newEditor')
    }

})

function init() {

    try {
        threeEditor = new ThreeEditor(editor.value, {
            fps: null,
            pixelRatio: window.devicePixelRatio * 1,
            webglRenderParams: { antialias: true, alpha: true, logarithmicDepthBuffer: true },
            sceneParams: JSON.parse(localStorage.getItem(dataCores.sceneName + '-newEditor')) || tamplateJson
        })
    } catch (error) {
        localStorage.removeItem(dataCores.sceneName + '-newEditor')
    }



    emits('emitThreeEditor', threeEditor)
    window.addEventListener('resize', () => window.threeEditor?.renderSceneResize?.())

}

onMounted(() => init())
onUnmounted(() => threeEditor?.destroySceneRender());

</script>

<style scoped>
.edit {
    width: 100vw;
    height: 100vh;
}
</style>