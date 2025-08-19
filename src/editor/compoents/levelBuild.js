import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export default {
    name: '大楼展开和合并',
    label: '大楼展开和合并',
    create: async function (storage, { scene }) {

        const model = await new Promise(
            resolve => new GLTFLoader().load(
                'https://z2586300277.github.io/3d-file-server/models/lou.glb',
                gltf => (gltf.scene.animations = gltf.animations, resolve(gltf.scene))
            )
        )

        const mixer = new THREE.AnimationMixer(model)

        let currentActions = []
        const playActions = arr => {

            currentActions.forEach(action =>action.stop())
            currentActions = arr.map(index => {

                const action = mixer.clipAction(model.animations[index]);
                action.loop = THREE.LoopOnce;
                action.clampWhenFinished = true;
                action.play();
                return action;

            })

        }

        const clock = new THREE.Clock()
        scene.addUpdateListener(() => {
            const deltaTime = clock.getDelta()
            mixer.update(deltaTime)
        })

        const label = new CSS2DObject(document.createElement('div'));
        model.add(label);
        let state = false
        const getText = () => state ? '☘️点击合并' : '☘️点击展开';
        label.element.textContent = getText();
        label.position.set(0, 14, 0);
        label.element.style.fontSize = '24px';
        label.element.style.cursor = 'pointer';
        label.element.style.pointerEvents = 'auto';
        label.element.addEventListener('click', () => {
            state = !state;
            label.element.textContent = getText();
            state ? playActions([1, 3, 5, 7]) : playActions([2, 4, 6, 8]);
        });

        return model;
    },
};
