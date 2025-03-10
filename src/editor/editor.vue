<template>
    <div class="edit" ref="editor"> </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ThreeEditor } from '../../../Vite_three-editor/dist/index'
// import { ThreeEditor } from 'three-edit-cores'

const editor = ref(null)

onMounted(() => {

    new ThreeEditor(editor.value, {

        fps: null,

        pixelRatio: window.devicePixelRatio * 1,

        webglRenderParams: { antialias: true, alpha: true, logarithmicDepthBuffer: true },

        sceneParams: null

    })

});

</script>

<style scoped>
.edit {
    width: 100vw;
    height: 100vh;
}
</style>