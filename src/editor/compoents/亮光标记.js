
import * as THREE from 'three';
import  gsap from 'gsap';

export default {
    name: '亮光标记',
    label: '亮光标记',
    create: function (storage, { scene }) {
        const circlePlane = new THREE.PlaneGeometry(6, 6)
        const circleTexture = new THREE.TextureLoader().load(`https://z2586300277.github.io/3d-file-server/` + 'images/channels/label.png')
        const circleMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: circleTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide
        })
        const circleMesh = new THREE.Mesh(circlePlane, circleMaterial)
        circleMesh.rotation.x = -Math.PI / 2
        gsap.to(circleMesh.scale, {
            duration: 1 + Math.random() * 0.5,
            x: 1.5,
            y: 1.5,
            repeat: -1
        })

        const lightPillarTexture = new THREE.TextureLoader().load(`https://z2586300277.github.io/3d-file-server/` + 'images/channels/light_column.png')
        const lightPillarGeometry = new THREE.PlaneGeometry(3, 20)
        const lightPillarMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            map: lightPillarTexture,
            alphaMap: lightPillarTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        })
        const lightPillar = new THREE.Mesh(lightPillarGeometry, lightPillarMaterial)
        lightPillar.add(lightPillar.clone().rotateY(Math.PI / 2))
        circleMesh.position.set(0, -10, 0)

        lightPillar.add(circleMesh)

        return lightPillar;
    },
};
