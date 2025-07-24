
import * as THREE from 'three';

export default {
    name: 'zhuizi',
    label: '锥子',
    create: function (storage, { scene }) {

        const geometry = new THREE.ConeGeometry(3.5, 5.5, 4);
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load("https://g2657.github.io/examples-server/smartCity/demo/image/gradual_change_y_02.png");
        const material = new THREE.MeshBasicMaterial({
            map: texture
        })

        const cone = new THREE.Mesh(geometry, material);
        cone.rotation.x = -Math.PI;

        let rd = { d: 0.04, py: 0 }
        setTimeout(() => { rd.py = cone.position.y }, 100);

        scene.addUpdateListener(() => {
            if (cone.position.y > (rd.py + 2) || cone.position.y < (rd.py - 2)) rd.d = -rd.d
            cone.position.y += rd.d;
            cone.rotation.y += Math.PI / 100;
        })

        return cone;
    },
};
