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

    <!-- 简化后的辅助工具控制面板 -->
    <div class="helper-controls">
        <div class="control-group">
            <div class="group-header">
                <span class="group-title">场景选项</span>
                <div class="divider"></div>
            </div>

            <div class="control-options">

                <!-- 像素比 -->
                <div class="pixel-ratio" style="display:flex;align-items:center;gap:8px;">
                    <el-icon style="color:#a8d4fd;">
                        <ScaleToOriginal />
                    </el-icon>
                    <span style="color:#e5eaf3;">像素比</span>
                    <el-input-number v-model="pixelRatio" :min="0.5" :max="3" :step="0.5"></el-input-number>
                </div>

                <!-- logarithmicDepthBuffer 选项 -->
                <el-checkbox v-model="logbuffer">
                    <div class="option-label">
                        <el-icon>
                            <Histogram />
                        </el-icon>
                        <span>全局对数深度缓冲(刷新)</span>
                    </div>
                </el-checkbox>

                <el-checkbox v-model="showGrid" @change="toggleGrid">
                    <div class="option-label">
                        <el-icon>
                            <Grid />
                        </el-icon>
                        <span>显示网格</span>
                    </div>
                </el-checkbox>

                <el-checkbox v-model="showAxes" @change="toggleAxes">
                    <div class="option-label">
                        <el-icon>
                            <ScaleToOriginal />
                        </el-icon>
                        <span>显示坐标轴</span>
                    </div>
                </el-checkbox>
            </div>
        </div>
    </div>

    <!-- 外部链接面板 -->
    <div class="external-links">
        <div class="control-group">
            <div class="group-header">
                <span class="group-title">快捷链接 <img src="https://visitor-badge.laobi.icu/badge?page_id=three_editor" > </span> 
                <div class="divider"></div>
            </div>
            <div class="links-container">
                <el-button v-for="link in externalLinks" :key="link.name" type="primary" plain size="small"
                    class="link-button" @click="openLink(link.url)">
                    <el-icon>
                        <component :is="link.icon" />
                    </el-icon>
                    <span>{{ link.name }}</span>
                </el-button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { Grid, ScaleToOriginal, Histogram } from '@element-plus/icons-vue'

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

// 网格和坐标轴控制
const showGrid = ref(false)
const showAxes = ref(false)

// 处理网格显示/隐藏
const toggleGrid = (val) => {
    threeEditor.handler.helpers.grid.showGrid = val
}

// 处理坐标轴显示/隐藏
const toggleAxes = (val) => {
    threeEditor.handler.helpers.axes.showAxes = val
}

// 像素比设置
const pixelRatio = ref(1)
if (localStorage.getItem('new_threeEditor_pixelRatio')) pixelRatio.value = parseFloat(localStorage.getItem('new_threeEditor_pixelRatio'))
watch(pixelRatio, (val) => {
    localStorage.setItem('new_threeEditor_pixelRatio', val)
    setTimeout(() => {
        window.location.reload()
    }, 500);
})

// 外部链接数据
const externalLinks = reactive([
    { name: '素材库', url: 'https://z2586300277.github.io/3d-file-server/link.html', icon: 'Collection' },
    { name: '官方示例', url: 'https://openthree.github.io/three-official-examples/#/example', icon: 'Document' },
    { name: 'Npm内核', url: 'https://www.npmjs.com/package/three-edit-cores', icon: 'Box' },
    { name: '联系方式', url: 'https://z2586300277.github.io/personalCode.html' , icon: 'ChatDotRound' },

])

// 打开外部链接
const openLink = (url) => {
    window.open(url, '_blank')
}

const logbuffer = ref(true)
if (localStorage.getItem('new_threeEditor_logBuffer') === 'false') logbuffer.value = false
watch(logbuffer, (val) => {
    localStorage.setItem('new_threeEditor_logBuffer', val)
    setTimeout(() => {
        window.location.reload()
    }, 500);
})

defineExpose({
    helperConf(tr) {
        showGrid.value = tr.handler.helpers.grid.showGrid
        showAxes.value = tr.handler.helpers.axes.showAxes
    }
});
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

/* 辅助工具控制面板样式 */
.helper-controls {
    margin-top: 10px;
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
}

.control-group {
    background-color: rgba(30, 30, 30, 0.6);
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.group-header {
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
}

.group-title {
    font-size: 15px;
    font-weight: 500;
    color: #a8d4fd;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.divider {
    height: 1px;
    background: linear-gradient(90deg, rgba(168, 212, 253, 0.3), transparent);
    width: 100%;
}

.control-options {
    display: flex;
    flex-wrap: wrap;
    gap: 15px;
}

.option-label {
    display: flex;
    align-items: center;
    gap: 8px;
}

.option-label .el-icon {
    color: #a8d4fd;
}

/* Element Plus样式覆盖 */
:deep(.el-checkbox) {
    .el-checkbox__label {
        color: #e5eaf3;
        font-size: 14px;
    }
}

.external-links {
    margin-top: 20px;
    width: 100%;
    padding: 0 10px;
    box-sizing: border-box;
}

.links-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
}

.link-button {
    display: flex;
    align-items: center;
    gap: 8px;
    border-radius: 6px;
    background-color: rgba(50, 50, 60, 0.5);
    border: 1px solid rgba(168, 212, 253, 0.3);
    transition: all 0.3s;
    flex: 1;
    min-width: 100px;
}
</style>
