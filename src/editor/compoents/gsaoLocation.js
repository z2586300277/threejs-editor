import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import gsap from 'gsap';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export default {
    name: '动画定位',
    label: '动画定位',
    async create(_, { scene, controls, effectComposer, transformControls }) {
        const group = new THREE.Group();

        const loader = new GLTFLoader();
        const model = await loader.loadAsync('https://z2586300277.github.io/3d-file-server/models/uav.glb');
        const mesh = model.scene;

        // 生成5-10 的随机整数
        const scale = Math.floor(Math.random() * 6) + 5;

        for (let i = 0; i < scale; i++) {
            const x = Math.random() * 120 - 60;
            const y = Math.random() * 120 - 60;
            const z = Math.random() * 120 - 60;

            const m = mesh.clone();
            m.position.set(x, y, z);
            m.rotation.y = Math.random() * Math.PI * 2;

            m.name = i + '-' + 'UAV'

            const div = document.createElement('div');
            div.style.color = 'white';
            div.style.pointerEvents = 'none';
            div.innerText = m.name;

            const label = new CSS2DObject(div);
            label.position.set(0, 3, 0);
            label.visible = false;

            m.add(label)
            m.label = label


            group.add(m);
        }
        group.EVENTCALL = (info) => {

            let m = info.object
            transformControls.detach()
            while (m.parent && m.parent !== group) m = m.parent
            effectComposer.effectPass.outlinePass.selectedObjects = [m]

            gsap.to(controls.target, {
                x: m.position.x,
                y: m.position.y,
                z: m.position.z
            })

            gsap.to(controls.object.position, {
                x: m.position.x + 20,
                y: m.position.y + 20,
                z: m.position.z + 20,
            })
            m.label.visible = true


        }
        return group
    }


}