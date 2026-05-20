<template>
    <div style="padding-top: 8px;">
        <span class="group-title"> &nbsp;&nbsp; &nbsp;&nbsp;场景树 <el-button title="清理缓存" link style="margin-right: 25px;" :icon="BrushFilled " @click="clear"></el-button></span> 
        <div class="divider"></div>
    </div>
    <div class="scene-tree">
        <div v-for="value,k in sceneObjList" class="item"
            :key="k">
            <el-icon v-if="value.children.length" class="coin" style="font-size:16px;">
                <ArrowRightBold />&nbsp;
            </el-icon>
            <el-icon class="coin" @click="value.visible = !value.visible">
                <View v-show="value.visible" />
                <Hide v-show="!value.visible" />
            </el-icon> 
            &nbsp;&nbsp;    
            <el-input v-if="editingId === value.id" v-model="value.name" size="small" autofocus @blur="editingId = null" @keyup.enter="editingId = null" style="width:100px" />
            <div v-else class="text" @click="selectObj(value)" @dblclick="editingId = value.id">{{ value.name || value.type }} </div>
           <div class="del">
              <el-popconfirm title="确定删除？" @confirm="delI(value)">
                <template #reference>
                    <el-icon class="coin">
                        <Delete />
                    </el-icon>
                </template>
            </el-popconfirm>
           </div>
        </div>
    </div>
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
            <!-- <div class="group-header">
                <span class="group-title">场景选项</span>
                <div class="divider"></div>
            </div> -->

            <div class="control-options">

                <!-- 像素比 -->
                <div class="pixel-ratio" style="display:flex;align-items:center;gap: 2px;">
                    <el-icon style="color:#a8d4fd;">
                        <ScaleToOriginal />
                    </el-icon>
                    <span style="color:#e5eaf3;font-size: 13px;">&nbsp;像素比&nbsp;&nbsp;</span>
                    <el-input-number size="small" v-model="pixelRatio" :min="0.5" :max="3" :step="0.5"></el-input-number>
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
    <div class="scene-stats">
       <span>物体 {{ sceneStats.objects.toLocaleString() }}</span><span>顶点 {{ sceneStats.vertices.toLocaleString() }}</span><span>三角面 {{ sceneStats.triangles.toLocaleString() }}</span>
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
import { computed, reactive, ref, shallowReactive, watch } from 'vue'
import { Grid, ScaleToOriginal, Histogram, View, Hide, Delete, ArrowRightBold, BrushFilled } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'

const sceneObjList = reactive([])
const editingId = ref(null)
const sceneStats = reactive({ vertices: 0, edges: 0, triangles: 0, objects: 0 })

function updateSceneStats() {
  let vertices = 0, triangles = 0, objects = 0
  const scene = window.threeEditor?.scene
  if (!scene) return
  scene.traverse(obj => {
    if (obj.isTransformControls || obj.isHelper || obj.type?.includes('Helper')) return
    const geo = obj.geometry
    if (!geo) return
    objects++
    const pos = geo.attributes?.position
    if (pos) vertices += pos.count
    if (geo.index) triangles += geo.index.count / 3
    else if (pos) triangles += pos.count / 3
  })
  sceneStats.vertices = vertices
  sceneStats.edges = Math.floor(triangles * 1.5)
  sceneStats.triangles = Math.floor(triangles)
  sceneStats.objects = objects
}
window.updateSceneStats = updateSceneStats

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
    { name: 'Npm内核', url: 'https://www.npmjs.com/package/three-edit-cores', icon: 'Box' },
    { name: 'B站', url: 'https://space.bilibili.com/245165721' , icon: 'ChatDotRound' },
    { name: '交流群', url: 'https://z2586300277.github.io/personalCode.html', icon: 'Document' },
    { name: '定制开发', url: 'https://www.goofish.com/personal?userId=2885508577', icon: 'Promotion' },
    { name: '赞赏', url: 'https://z2586300277.github.io/sponsor.html', icon: 'StarFilled' },
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
    },
    startEditor(te) {
        const { scene } = te
        const push_obj = args => {
            args.map(obj => {
             ['PerspectiveCamera','AxesHelper','GridHelper','Box3Helper'].indexOf(obj.type) === -1 && sceneObjList.unshift(obj)
            })
        }
        push_obj(scene.children.filter(c => {
            if(c.isTransformControlsRoot) return false
            return true
        }))
        const sceneAdd = scene.add
        scene.add = function (...args) {
            args.forEach(obj => {
                 push_obj([obj])
            })
            sceneAdd.apply(this, args)
            updateSceneStats()
        }
        const sceneRemove = scene.remove
        scene.remove = function (...args) {
            args.forEach(obj => {
                const index = sceneObjList.findIndex(i => i.id === obj.id)
                if (index > -1) {
                    sceneObjList.splice(index, 1)
                }
            })
            sceneRemove.apply(this, args)
            updateSceneStats()
        }
    }
});

function selectObj(item) {
   try {
     if(item.visible == false) return
     const i = threeEditor.scene.children.find(c => c.id === item.id)
     threeEditor.transformControls.attach(i)
   }
    catch (error) {}
}

function delI(item) {
    const i = threeEditor.scene.children.find(c => c.id === item.id)
    threeEditor.scene.remove(i)
}

function clear() {
    ElMessageBox.confirm('确定要清理所有缓存吗？这将清除浏览器存储的 localStorage、sessionStorage 和 IndexedDB 数据，页面将自动刷新。', '清理缓存', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
    }).then(() => {
        // 清除 localStorage
        localStorage.clear()
        // 清除 sessionStorage
        sessionStorage.clear()
        // 清除 IndexedDB
        window.indexedDB.deleteDatabase('new_threeEditor_db')
        ElMessage({
            type: 'success',
            message: '缓存已清理，页面即将刷新',
        })
        setTimeout(() => window.location.reload(), 1000)
    }).catch(() => {})
}
</script>

<style lang="less" scoped>
.skyList {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 5px;
    padding: 0px 10px 0px 10px;
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
    height: 120px;
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
    padding: 0px 12px 0px 12px;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.group-header {
    margin-bottom: 12px;
    display: flex;
    flex-direction: column;
}

.group-title {
    font-size: 14px;
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
    gap: 5px;
}

.option-label {
    display: flex;
    font-size: 13px;
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
    // margin-top: 20px;
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

.scene-tree {
    width: 100%;
    box-sizing: border-box;
    height: 180px;
    font-size: 12px;
    display: grid;
    grid-auto-rows: 30px;
    align-items: center;
    margin-top: 5px;
    // justify-content: center;
    padding: 2px 30px 5px 20px;
    overflow: scroll;
    .text {
        &:hover {
            color: #99ceff;
            transition: all 0.5s;
        }
    }
    .item {
        display: flex;
        height: 100%;
        align-items: center;
        cursor: pointer;
    }
    .coin {
        :hover {
            color: #99ceff;
            font-weight: bold;
            transition: all 0.5s;
        }
    }
    .del {
        //   flex end 
        flex: 1;
        display: flex;
        justify-content: flex-end;
        
    }
}

.scene-stats {
  font-size: 10px;
  margin-top: 5px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-evenly;
}
</style>
