import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export default {
    name: 'roomEnv',
    label: 'roomEnv',
    create(_, { scene, camera, renderer }) {

        const pmrem = new THREE.PMREMGenerator(renderer)
        const rootEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture

        scene.environment = rootEnv;
        scene.background = rootEnv;  // 可选：设置背景也为相同环境

        const group = new THREE.Group()

        const loader = new GLTFLoader()
        const dracoLoader = new DRACOLoader()
        dracoLoader.setDecoderPath('https://z2586300277.github.io/three-editor/dist/draco/')
        loader.setDRACOLoader(dracoLoader)

        return new Promise(resolve => {

            loader.load('https://z2586300277.github.io/3d-file-server/models/room/white_room.glb', (gltf) => {
                const model = gltf.scene

                model.traverse((child) => {
                    if (!child.isMesh) return
                    const materials = Array.isArray(child.material) ? child.material : [child.material]
                    materials.forEach((mat) => {
                        if (!mat) return
                        mat.envMap = rootEnv
                        mat.metalness = 1
                        mat.roughness = 0
                        mat.envMapIntensity = 1.0
                        mat.needsUpdate = true
                    })
                })

                group.add(model)
                resolve(group)
            })

        })
    }
}
