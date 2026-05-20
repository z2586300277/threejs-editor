import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import gsap from 'gsap'

export default {

    name: '人物行走',

    label: '人物行走',

    async create(storage, { camera, scene, renderer, controls }) {

        const group = new THREE.Group()

        const modelUrl = storage?.url || 'https://z2586300277.github.io/3d-file-server/files/model/Soldier.glb'
        group.url = modelUrl

        // 地面网格
        group.add(new THREE.GridHelper(40, 20))

        // 加载模型
        const gltf = await new GLTFLoader().loadAsync(modelUrl)

        const model = gltf.scene
        group.add(model)

        const clock = new THREE.Clock() // 时钟
        const mixer = new THREE.AnimationMixer(model) // 模型动画
        const currentAction = mixer.clipAction(gltf.animations[3]) // walk 动画

        // 每帧驱动动画
        scene.addUpdateListener(() => mixer.update(clock.getDelta()))

        // 加载后将相机对准人物
        model.updateWorldMatrix(true, true)
        const box3 = new THREE.Box3().setFromObject(model)
        const center = new THREE.Vector3()
        box3.getCenter(center)
        const size = new THREE.Vector3()
        box3.getSize(size)
        const h = size.y || 2

        if (controls) {
            controls.target.copy(center)
            controls.update()
        }

        // 射线 & 目标位置
        const raycaster = new THREE.Raycaster()
        const targetPositon = new THREE.Vector3()
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0) // 碰撞面

        let oldgsap = null

        function goAddress(targetPos) {

            oldgsap?.kill() // 停止上一个动画

            const worldPos = new THREE.Vector3()
            model.getWorldPosition(worldPos) // model 世界坐标

            const distance = worldPos.distanceTo(targetPos) // 世界空间距离
            if (distance < 0.01) return

            const vector = camera.position.clone().sub(worldPos) // camera 和 model 世界坐标差向量

            // 用世界坐标计算朝向，+Math.PI 适配模型正面为 -Z 的情况
            model.rotation.y = Math.atan2(
                targetPos.x - worldPos.x,
                targetPos.z - worldPos.z
            ) + Math.PI

            // 将世界坐标目标点转为 group 本地坐标，再换算为 model 本地坐标
            const localTarget = group.worldToLocal(targetPos.clone())

            // 用本地距离计算 duration，使速度与 group 缩放无关（缩放越大本地距离越小，duration 同步缩短）
            const localDistance = model.position.distanceTo(localTarget)
            const duration = localDistance / 3

            oldgsap = gsap.to(model.position, {

                x: localTarget.x, y: localTarget.y, z: localTarget.z,
                duration, ease: 'none',

                onStart: () => {
                    if (controls) controls.enabled = false // 禁止控制
                    currentAction.paused = false
                    currentAction.play() // 播放动画
                },

                onUpdate: () => {
                    const wp = new THREE.Vector3()
                    model.getWorldPosition(wp)
                    if (controls) controls.target.copy(wp) // 目标跟随（世界坐标）
                    camera.position.lerp(wp.clone().add(vector), 0.1) // 相机跟随
                },

                onComplete: () => {
                    if (controls) controls.enabled = true // 恢复控制
                    currentAction.paused = true // 暂停在最后帧，不重置模型姿态
                }

            })

        }

        // 点击事件 —— 双击地面移动人物
        const onClick = (event) => {

            const el = renderer.domElement
            const mouse = new THREE.Vector2(
                (event.offsetX / el.clientWidth) * 2 - 1,
                -(event.offsetY / el.clientHeight) * 2 + 1
            )

            raycaster.setFromCamera(mouse, camera)
            raycaster.ray.intersectPlane(plane, targetPositon)

            goAddress(targetPositon.clone())

        }

        renderer.domElement.addEventListener('dblclick', onClick)

        // 销毁时清理
        group.userData.dispose = () => {
            renderer.domElement.removeEventListener('dblclick', onClick)
            oldgsap?.kill()
        }

        return group

    },

    getStorage(m) {
        return { url: m.url }
    }

}

/**
 * 名称: 点击第三人称移动
 * 作者: 优雅永不过时 https://z2586300277.github.io/
 */
