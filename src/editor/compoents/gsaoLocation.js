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

            // 计算模型包围盒
            const box = new THREE.Box3().setFromObject(m);
            const size = new THREE.Vector3();
            const center = new THREE.Vector3();
            box.getSize(size);
            box.getCenter(center);

            // 计算相机距离，使模型完整显示
            const maxSize = Math.max(size.x, size.y, size.z);
            const fov = controls.object.fov || 50;
            const camera = controls.object;
            const aspect = camera.aspect || 1.5;
            const fitHeightDistance = maxSize / (2 * Math.tan(THREE.MathUtils.degToRad(fov / 2)));
            const fitWidthDistance = maxSize / (2 * Math.tan(THREE.MathUtils.degToRad(fov / 2))) / aspect;
            const distance = Math.max(fitHeightDistance, fitWidthDistance) * 1.5;

            // 计算新的相机位置（从当前相机方向看向目标中心）
            const dir = new THREE.Vector3();
            camera.getWorldDirection(dir);
            dir.normalize().negate(); // 反向
            const newPos = center.clone().add(dir.multiplyScalar(distance));

            // 动画移动 controls.target 和 camera.position
            gsap.to(controls.target, {
                x: center.x,
                y: center.y,
                z: center.z
            });

            gsap.to(camera.position, {
                x: newPos.x,
                y: newPos.y,
                z: newPos.z
            });
            m.label.visible = true


        }
        return group
    }


}