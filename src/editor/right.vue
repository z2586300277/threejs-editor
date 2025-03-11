<template>
    <div class="skyList">
        <!-- 下拉菜单替换原有标题 -->
        <div class="control-header">
            <el-select v-model="selectedSet" placeholder="选择素材套" class="set-select">
                <el-option v-for="i in datalist" :key="i.name" :label="i.name" :value="i.name" />
            </el-select>
            <div class="flex">
                <el-button @click="setSky(selectedSet)" icon="CircleCheckFilled" style="height:30px;width:30px"
                    title="设为天空" />
                <el-button @click="setEnv(selectedSet)" icon="StarFilled" style="height:30px;width:30px" title="设为环境" />
            </div>
        </div>
        <!-- 资源预览 -->
        <div class="resource">
            <div v-for="k in 6" :key="k">
                <el-image class="img" :src="`${getUrl}${k}.png`" fit="cover" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'

const selectedSet = ref('蓝天')
const datalist = reactive([
    {
        name: '蓝天',
        url: 'https://z2586300277.github.io/three-editor/dist/files/scene/skyBox0/'
    },
    {
        name: '森林',
        url: 'https://z2586300277.github.io/three-editor/dist/files/scene/skyBox8/'
    },
    { name: '清除', url: '' }
])

const getUrl = computed(() => datalist.find(i => i.name === selectedSet.value).url)

const setSky = (v) => {
    const set = datalist.find(i => i.name === v)
    if (!set.url) return threeEditor.scene.background = null
    threeEditor.scene.setSceneBackground(Array.from({ length: 6 }, (_, i) => `${set.url || ''}${i + 1}.png`))
}

const setEnv = (v) => {
    const set = datalist.find(i => i.name === v)
    if (!set.url) return threeEditor.scene.envBackground = null
    threeEditor.scene.setEnvBackground(Array.from({ length: 6 }, (_, i) => `${set.url || ''}${i + 1}.png`))
    threeEditor.scene.environmentEnabled = true
};
</script>

<style lang="less" scoped>
.skyList {
    width: 100%;
    height: 33%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 10px;
    box-sizing: border-box;
}

.control-header {
    height: 40px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .set-select {
        flex: 1;
        margin-right: 10px;
    }

    .flex {
        display: flex;
        gap: 4px;
    }
}

.resource {
    display: grid;
    height: calc(100% - 20px);
    width: 100%;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    justify-items: center;
    align-items: center;
}

.img {
    width: 50px;
    height: 50px;
}
</style>
