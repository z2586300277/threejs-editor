
import * as THREE from 'three';
import { ElMessage } from 'element-plus';
import gsap from 'gsap';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export default {
    name: '组件事件映射',
    label: '组件事件映射',
    create: async function (storage, { scene }) {

        const group = new THREE.Group();
        const cube = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial({ color: Math.random() * 0xffffff })
        );
        cube.name = '立方体'
        cube.position.set(-2, 0, 0);
        group.add(cube);

        const cone = new THREE.Mesh(
            new THREE.ConeGeometry(0.5, 1, 32),
            new THREE.MeshBasicMaterial({ color: 'pink', transparent: true, opacity: 0.5 })
        );
        cone.name = '圆锥体'
        cone.position.set(2, 0, 0);
        group.add(cone);

        const infoPanelDiv = document.createElement('div');
        infoPanelDiv.style.width = '260px';
        infoPanelDiv.style.height = 'auto';
        infoPanelDiv.style.background = 'rgba(30, 30, 30, 0.85)';
        infoPanelDiv.style.borderRadius = '12px';
        infoPanelDiv.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)';
        infoPanelDiv.style.padding = '18px 24px';
        infoPanelDiv.style.color = '#fff';
        infoPanelDiv.style.fontSize = '18px';
        infoPanelDiv.style.pointerEvents = 'none';
        infoPanelDiv.style.border = '1px solid #444';

        infoPanelDiv.innerHTML = `
            <div style="font-weight:bold; font-size:22px; margin-bottom:8px;">
            自定义组件事件映射
            </div>
            <ul style="margin:0; padding-left:18px; font-size:16px;">
            <li>双击 <span style="color:#4fc3f7;">立方体</span> 变色</li>
            <li>双击 <span style="color:#ffd54f;">圆锥体</span> 缩放和透明度变化</li>
            <li>双击 <span style="color:#ff8a65;">猴头</span> 旋转</li>
            </ul>
        `;

        const infoPanel = new CSS2DObject(infoPanelDiv);
        infoPanel.position.set(1, 1.2, 0);
        group.add(infoPanel);

        new GLTFLoader().load(
            'https://z2586300277.github.io/3d-file-server/models/glb/monkey.glb',
            gltf => {
                gltf.scene.name = '猴头'
                gltf.scene.isEvent = true
                group.add(gltf.scene);
            }
        );

        group.EVENTCALL = (info) => {

            let { object } = info;

            switch (object.name) {

                case '立方体':
                    object.material.color.setHex(Math.random() * 0xffffff);
                    break;

                case '圆锥体':

                    object.material.opacity = Math.random();
                    gsap.to(object.scale, { x: Math.random() * 2,  y: Math.random() * 2,  z: Math.random() * 2})

                    break;
                default:

                    while (object && !object.isEvent) object = object.parent;
                    gsap.to(object.rotation, { y: Math.random() * Math.PI * 2 });

                    break;
            }

            ElMessage({ message: `事件触发: ${object.name}`, type: 'success' });

        }

        group.REMOVECALL = () => {
            group.remove(infoPanel);
        }

        return group;
    }
}