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
const { dataCores } = defineProps(['dataCores'])
const emits = defineEmits(['emitThreeEditor'])
window.GUI_PARAMS = {
    step: 0.1,
}

watch(() => dataCores.sceneName, (val) => {

    let params = localStorage.getItem(val)
    params = JSON.parse(params) || tamplateJson
    threeEditor?.resetEditorStorage(params)

})

function init() {

    threeEditor = new ThreeEditor(editor.value, {

        fps: null,
        pixelRatio: window.devicePixelRatio * 1,
        webglRenderParams: { antialias: true, alpha: true, logarithmicDepthBuffer: true },
        sceneParams: JSON.parse(localStorage.getItem(dataCores.sceneName)) || tamplateJson

    })

    emits('emitThreeEditor', threeEditor)

    window.addEventListener('resize', () => window.threeEditor?.renderSceneResize?.())

}

onMounted(() =>  init())

onUnmounted(() => threeEditor?.destroySceneRender());

</script>

<style scoped>
.edit {
    width: 100vw;
    height: 100vh;
}
</style>