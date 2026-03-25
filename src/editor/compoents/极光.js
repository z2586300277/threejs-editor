import * as THREE from 'three';

export default {
    name: '极光',
    label: '极光',

    initParameters: {
        width: 30,
        height: 15,
        color1: '#00ff88',
        color2: '#0088ff',
        speed: 1
    },

    create(storage, { scene }) {
        const params = storage || this.initParameters;

        const geometry = new THREE.PlaneGeometry(params.width, params.height, 128, 64);
        const material = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.DoubleSide,
            uniforms: {
                uTime: { value: 0 },
                uColor1: { value: new THREE.Color(params.color1) },
                uColor2: { value: new THREE.Color(params.color2) }
            },
            vertexShader: `
                uniform float uTime;
                varying vec2 vUv;
                varying float vElevation;

                void main() {
                    vUv = uv;
                    vec3 pos = position;

                    float wave = sin(pos.x * 0.5 + uTime) * cos(pos.x * 0.3 - uTime * 0.7);
                    pos.z += wave * 3.0;
                    vElevation = wave;

                    gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor1;
                uniform vec3 uColor2;
                uniform float uTime;
                varying vec2 vUv;
                varying float vElevation;

                void main() {
                    float pattern = sin(vUv.x * 10.0 + uTime) * 0.5 + 0.5;
                    vec3 color = mix(uColor1, uColor2, pattern);

                    float alpha = (1.0 - abs(vUv.y - 0.5) * 2.0) * 0.6;
                    alpha *= smoothstep(-1.0, 1.0, vElevation);

                    gl_FragColor = vec4(color, alpha);
                }
            `
        });

        const mesh = new THREE.Mesh(geometry, material);

        scene.addUpdateListener(() => {
            material.uniforms.uTime.value += 0.016 * params.speed;
        });

        mesh.onRemoveCall = () => {
            geometry.dispose();
            material.dispose();
        };

        mesh.userData.params = params;
        mesh.userData.material = material;
        return mesh;
    },

    createPanel(mesh, folder) {
        const p = mesh.userData.params;
        const mat = mesh.userData.material;

        folder.add(p, 'speed', 0, 5).name('速度');
        folder.addColor(p, 'color1').name('颜色1').onChange(() => {
            mat.uniforms.uColor1.value.set(p.color1);
        });
        folder.addColor(p, 'color2').name('颜色2').onChange(() => {
            mat.uniforms.uColor2.value.set(p.color2);
        });
    },

    getStorage(mesh) {
        return mesh.userData.params;
    }
};
