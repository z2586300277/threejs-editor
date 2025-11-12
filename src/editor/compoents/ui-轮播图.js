import { ElCarousel, ElCarouselItem } from 'element-plus';
import { createApp, h } from 'vue';
import { CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
import * as THREE from 'three';

export default {
    name: 'ui-轮播图',
    label: 'ui-轮播图',

    create() {

        const CarouselComponent = {
            render() {

                const slides = [
                    { name: '优雅永不过时', url: 'https://z2586300277.github.io/site.png' },
                    { name: '低代码编辑器', url: 'https://z2586300277.github.io/3d-file-server/images/editor.jpg' },
                    { name: '开源案例', url: 'https://z2586300277.github.io/3d-file-server/images/threeCesiumExamples.jpg' },
                ];
                return h(ElCarousel, {
                    style: {
                        width: '300px',
                        height: '150px'
                    },
                    interval: 1000,
                }, () => slides.map(slide =>
                    h(ElCarouselItem, {
                        key: slide.name,
                        style: {
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '300px',
                            height: '150px'
                        }
                    }, () => h('img', {
                        src: slide.url,
                        text: slide.name,
                        style: {
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                        }
                    }))
                ))
            }
        };

        const app = createApp(CarouselComponent)

        const mountPoint = document.createElement('div')

        app.mount(mountPoint)

        const mesh = new CSS3DObject(mountPoint.firstElementChild);

        const box = new THREE.BoxGeometry(400, 60, 40)
        const material = new THREE.MeshBasicMaterial({ color: 'yellow', visible: false });
        const m = new THREE.Mesh(box, material);
        mesh.position.y += 100;

        const group = new THREE.Group();
        group.add(m);
        group.add(mesh)

        group.REMOVECALL = () => {
            group.remove(mesh);
        }

        return group

    }

}
