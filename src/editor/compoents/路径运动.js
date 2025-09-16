import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

export default {

    name: '模型路径运动',

    label: '模型路径运动',

    async create(storage, { camera, scene, renderer }) {

        // 调用window.输入框获取用户输入的URL
        let url = ''
        if (storage?.url) url = storage.url
        else url = window.prompt('请输入模型的URL', 'https://z2586300277.github.io/three-cesium-examples/files/model/car.glb')
        if (!url) return

        const group = new THREE.Group()
        group.url = url

        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('https://z2586300277.github.io/three-editor/dist/draco/')
        const gltf = await new GLTFLoader().setDRACOLoader(dracoLoader).loadAsync(url)
        group.add(gltf.scene)

        const box3 = new THREE.Box3().setFromObject(gltf.scene)
        const boxSize = new THREE.Vector3()
        box3.getSize(boxSize)
        // 将尺寸限制在10个单位内  超出等比缩小 不足放大 使用scale
        const maxSize = Math.max(boxSize.x, boxSize.y, boxSize.z)
        if (maxSize > 10) {
            const scale = 10 / maxSize
            gltf.scene.scale.setScalar(scale)
        }
        else if (maxSize < 10) {
            const scale = 10 / maxSize
            gltf.scene.scale.setScalar(scale)
        }
        if (gltf.animations.length) {
            const mixer = new THREE.AnimationMixer(gltf.scene)
            const action = mixer.clipAction(gltf.animations[gltf.animations.length - 1])
            action.play()
            scene.addUpdateListener(() => mixer.update(0.01))
        }

        // 在 100 * 200 * 80 的空间范围内随机选取 50 个点 作为路径点 然生生成路径线段
        const points = [new THREE.Vector3(0, 0, 0)]
        for (let i = 0; i < 5; i++) {
            const x = Math.random() * 100 - 50
            const y = Math.random() * 60 - 30
            const z = Math.random() * 100 - 50
            points.push(new THREE.Vector3(x, y, z))
        }

        const curve = new THREE.CatmullRomCurve3(points)
        const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(500))
        const color = new THREE.Color().setHSL(Math.random() / 2 + 0.6, 0.6 + Math.random() * 0.4, 0.6 + Math.random() * 0.2)
        const material = new THREE.LineBasicMaterial({ color })
        const curveObject = new THREE.Line(geometry, material)

        group.add(curveObject)

        let t = 0

        scene.addUpdateListener(() => {

            t += 0.0004

            const point = curve.getPointAt(t % 1) // 获取当前点

            gltf.scene.position.copy(point)

            const pointNext = curve.getPointAt((t + 0.01) % 1)

            pointNext.add(group.position)
            gltf.scene.lookAt(pointNext)
        })

        return group

    },

    getStorage: function (m) {
        return {
            url: m.url
        }
    }


}