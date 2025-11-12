import { ElRate } from 'element-plus';
import { createApp, h, ref } from 'vue';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import * as THREE from 'three';

export default {
    name: 'ui-评分',
    label: 'ui-评分',

    create() {

        const RateComponent = {
            setup() {
                const value1 = ref(3);
                
                return () => h('div', {
                    class: 'demo-rate-block',
                    style: {
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '10px',
                        backgroundColor: 'none',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }
                }, [
                    h('span', {
                        class: 'demonstration',
                        style: {
                            fontSize: '14px',
                            color: '#ffffff',
                            minWidth: '60px'
                        }
                    }, '优雅指数-'),
                    h(ElRate, {
                        modelValue: value1.value,
                        'onUpdate:modelValue': (val) => { value1.value = val; }
                    })
                ]);
            }
        };

        const app = createApp(RateComponent)

        const mountPoint = document.createElement('div')
        app.mount(mountPoint)

        const mesh = new CSS3DObject(mountPoint.firstElementChild);
        const box = new THREE.BoxGeometry(200, 50, 20)
        const material = new THREE.MeshBasicMaterial({ color: 'yellow', visible: false });
        const m = new THREE.Mesh(box, material);
        const group = new THREE.Group();
        group.add(m);
        mesh.position.y += 30
        group.add(mesh)

        group.REMOVECALL = () => {
            group.remove(mesh);
        }


        return group

    }

}