<template>
    <div class="edit" ref="editor"> </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import tamplateJson from './template.json'
import { ThreeEditor } from '../../../Vite_three-editor/lib/main'
// import { ThreeEditor } from '../../../Vite_three-editor/dist/index'
// import { ThreeEditor } from 'three-edit-cores'

ThreeEditor.dracoPath = __dracoPath__
let threeEditor = null
const editor = ref(null)
const { dataCores } = defineProps(['dataCores'])
const emits = defineEmits(['emitThreeEditor'])

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
        sceneParams: JSON.parse(localStorage.getItem(dataCores.sceneName))

    })

    emits('emitThreeEditor', threeEditor)

    window.addEventListener('resize', () => threeEditor.renderSceneResize())

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