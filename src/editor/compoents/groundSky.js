import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { GroundedSkybox } from 'three/examples/jsm/objects/GroundedSkybox.js';
export default {
    name: 'groundSky',
    label: 'groundSky',
    async create(_, { create }) {
        const hdrLoader = new RGBELoader();
        const envMap = await hdrLoader.loadAsync( 'https://threejs.org/examples/textures/equirectangular/blouberg_sunrise_2_1k.hdr' );
        envMap.mapping = THREE.EquirectangularReflectionMapping;
    
        const skybox = new GroundedSkybox( envMap , 15, 100 );
        return skybox;
    }
}