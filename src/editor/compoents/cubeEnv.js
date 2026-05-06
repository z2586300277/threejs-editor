import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export default {
    name: 'cubeEnv',
    label: 'cubeEnv',
    create(_, { scene, camera, renderer }) {


        const group = new THREE.Group();

        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://z2586300277.github.io/three-editor/dist/draco/')
        loader.setDRACOLoader(dracoLoader);


        const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256);
        cubeRenderTarget.texture.type = THREE.HalfFloatType;

        const cubeCamera = new THREE.CubeCamera(1, 100000, cubeRenderTarget);
        scene.add(cubeCamera);

        return new Promise(resolve => {

            loader.load('https://z2586300277.github.io/3d-file-server/models/room/small_wood_house.glb', (gltf) => {
                const model = gltf.scene;



                model.traverse((child) => {
                    if (!child.isMesh) return;
                    const m = child.material;
                    m.envMap = cubeRenderTarget.texture;
                    m.metalness = 1;
                    m.roughness = 0;
                    m.needsUpdate = true;


                });

                group.add(model);
                resolve(group);


                scene.addUpdateListener(() => {


                    cubeCamera.update(renderer, scene);
                });
            });

        });
    }
}
