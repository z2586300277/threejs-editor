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

async function init() {


    try {
        
        let sceneParams = JSON.parse(localStorage.getItem(dataCores.sceneName + '-newEditor')) || tamplateJson
        if (window.editorPreviewSceneUrl) {
            try {
                const res = await fetch(window.editorPreviewSceneUrl).then(res => res.json())
                if(res) sceneParams = res
            } catch (error) {}
        }

        let logarithmicDepthBuffer = true
        if (localStorage.getItem('new_threeEditor_logBuffer') === 'false') logarithmicDepthBuffer = false
        let pixelRatioMulti = 1
        if (localStorage.getItem('new_threeEditor_pixelRatio')) pixelRatioMulti = parseFloat(localStorage.getItem('new_threeEditor_pixelRatio'))
        threeEditor = new ThreeEditor(editor.value, {
            fps: null,
            pixelRatio: window.devicePixelRatio * pixelRatioMulti,
            webglRenderParams: { antialias: true, alpha: true, logarithmicDepthBuffer },
            sceneParams
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