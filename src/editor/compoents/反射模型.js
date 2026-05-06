import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'

export default {
    name: '反射模型',
    label: '反射模型',
    create(_, { scene, camera, renderer }) {


        const group = new THREE.Group();

        const loader = new GLTFLoader();
        const dracoLoader = new DRACOLoader();
        dracoLoader.setDecoderPath('https://z2586300277.github.io/three-editor/dist/draco/')
        loader.setDRACOLoader(dracoLoader);

        return new Promise(resolve => {

            loader.load('https://z2586300277.github.io/3d-file-server/models/room/dining_room.glb', (gltf) => {
                const model = gltf.scene;

                const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(512, {
                    generateMipmaps: true,
                    minFilter: THREE.LinearMipmapLinearFilter,
                });
                const cubeCamera = new THREE.CubeCamera(0.1, 10000, cubeRenderTarget);
                group.add(cubeCamera);

                model.traverse((child) => {
                    if (!child.isMesh) return;
                    const materials = Array.isArray(child.material) ? child.material : [child.material];
                    materials.forEach((mat) => {
                        if (!mat) return;
                        mat.envMap = cubeRenderTarget.texture;
                        mat.metalness = 0.8;
                        mat.roughness = 0.2;
                        mat.needsUpdate = true;
                    });
                });

                group.add(model);
                resolve(group);


                const center = new THREE.Vector3();
                scene.addUpdateListener(() => {


                    model.updateMatrixWorld(true);
                    new THREE.Box3().setFromObject(model).getCenter(center);
                    cubeCamera.position.copy(center);

                    model.visible = false;
                    cubeCamera.update(renderer, scene);
                    model.visible = true;

                });
            });

        });
    }
}
