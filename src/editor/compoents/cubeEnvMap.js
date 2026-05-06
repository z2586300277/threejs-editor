import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export default {
    name: 'cubeEnvMap',
    label: 'cubeEnvMap',
    create(_, { scene, camera, renderer }) {

        // 动态 CubeCamera：每帧从模型中心拍一张周围场景，作为所有材质的镜面反射源
        const cubeRT = new THREE.WebGLCubeRenderTarget(256, { type: THREE.HalfFloatType })
        const cubeCamera = new THREE.CubeCamera(0.1, 1000, cubeRT)

        const loader = new GLTFLoader()
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('https://z2586300277.github.io/three-editor/dist/draco/')
        loader.setDRACOLoader(dracoLoader)

        return new Promise(resolve => {

            loader.load('https://z2586300277.github.io/3d-file-server/models/yuanqu.glb', (gltf) => {
                const model = gltf.scene

                const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3())
                cubeCamera.position.copy(center)
                model.add(cubeCamera)

                model.traverse((child) => {
                    if (!child.isMesh) return
                    const materials = Array.isArray(child.material) ? child.material : [child.material]
                    materials.forEach((mat) => {
                        if (!mat) return
                        mat.envMap = cubeRT.texture
                        mat.envMapIntensity = 1
                        mat.metalness = 0.8
                        mat.roughness = 0.1
                        mat.needsUpdate = true
                    })
                })

                // 每帧更新反射：隐藏自身 → 拍周围 → 标记 PMREM 需要重算
                scene.addUpdateListener(() => {
                    model.visible = false
                    cubeCamera.update(renderer, scene)
                    cubeRT.texture.needsPMREMUpdate = true
                    model.visible = true
                })

                resolve(model)
            })

        })
    }
}
