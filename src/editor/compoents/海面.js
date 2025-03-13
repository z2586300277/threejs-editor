import * as THREE from 'three'
import { Water } from 'three/examples/jsm/objects/Water.js';

export default {
    name: '海面',
    label: '海面',
    create: function (_, { scene }) {
        const waterGeometry = new THREE.PlaneGeometry(10000, 10000);

        const water = new Water(
            waterGeometry,
            {
                textureWidth: 512,
                textureHeight: 512,
                waterNormals: new THREE.TextureLoader().load(  `https://z2586300277.github.io/3d-file-server/` +  '/images/texture/waternormals.jpg', function (texture) {
                  
                    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        
                }),
                sunDirection: new THREE.Vector3(),
                sunColor: 0xffffff,
                waterColor: 0x001e0f,
                distortionScale: 3.7,
                fog: scene.fog !== undefined
            }
        );
        
        water.rotation.x = - Math.PI / 2;

        scene.addUpdateListener(() => {
            water.material.uniforms['time'].value += 1.0 / 60.0;
        })
        

        return water;
    }
}